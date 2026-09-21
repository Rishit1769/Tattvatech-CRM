import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { sendEmail } from "@/lib/mail/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { buildInvoicePdf } from "@/lib/invoices/pdf";
import { queueInvoicePdf } from "@/lib/storage/invoice-storage";
import { removePrivateObject } from "@/lib/storage/minio";

export async function GET() {
  try {
    await requirePermission("finance.invoice.view");
    const invoices = await prisma.invoice.findMany({ include: { client: true, project: true, transaction: true, items: true }, orderBy: { invoiceDate: "desc" }, take: 200 });
    return NextResponse.json({ invoices });
  } catch (error) {
    return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load invoices", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("finance.transaction.create");
    const body = await request.json() as { transactionId?: string; companyName?: string; clientId?: string; invoiceDate?: string; product?: string; amount?: number; notes?: string };
    if (!body.transactionId && (!body.companyName || !body.clientId || !body.invoiceDate || !body.product || !body.amount)) return apiError("Company, client, date, product, and amount are required");
    if (!body.transactionId) {
      const client = await prisma.client.findUnique({ where: { id: body.clientId } });
      const amount = Number(body.amount);
      const product = body.product!;
      const invoiceDate = new Date(`${body.invoiceDate}T00:00:00.000Z`);
      if (!client) return apiError("The selected client was not found", 404);
      if (!Number.isFinite(amount) || amount <= 0) return apiError("Amount must be greater than zero");
      if (Number.isNaN(invoiceDate.getTime())) return apiError("Invoice date is invalid");
      const invoiceNumber = `TT-INV-${invoiceDate.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const invoice = await prisma.invoice.create({ data: { invoiceNumber, clientId: client.id, invoiceDate, subtotal: amount, total: amount, billingSnapshot: { companyName: body.companyName, clientName: client.name, clientEmail: client.email, notes: body.notes ?? null }, generatedById: user.id, items: { create: { description: product, quantity: 1, unitPrice: amount, lineTotal: amount } } }, include: { items: true, client: true } });
      const pdf = buildInvoicePdf({ invoiceNumber, companyName: body.companyName!, invoiceDate: body.invoiceDate!, product, amount, notes: body.notes });
      let storage: Awaited<ReturnType<typeof queueInvoicePdf>> | undefined;
      try {
        storage = await queueInvoicePdf({ invoiceNumber, bytes: pdf });
        await prisma.storedFile.create({ data: { entityType: "INVOICE", entityId: invoice.id, invoiceId: invoice.id, originalFilename: `${invoiceNumber}.pdf`, objectKey: storage.objectKey, mimeType: "application/pdf", sizeBytes: pdf.length, bucketName: storage.bucketName, uploadedById: user.id } });
      } catch (error) {
        if (storage?.objectKey) await removePrivateObject(storage.objectKey).catch(() => undefined);
        await prisma.invoice.delete({ where: { id: invoice.id } }).catch(() => undefined);
        if (error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED") return apiError("Document storage is not configured. The invoice was not saved.", 503);
        throw error;
      }
      await recordActivity({ activityType: "invoice.generated", actorUserId: user.id, entityType: "invoice", entityId: invoice.id, summary: `${user.fullName} generated ${invoice.invoiceNumber}.` });
      return NextResponse.json({ invoice, storage, pdf: { generated: true, bytes: pdf.length } }, { status: 201 });
    }
    const transaction = await prisma.transaction.findUnique({ where: { id: body.transactionId }, include: { client: true, project: true, invoice: true } });
    if (!transaction || transaction.type !== "PAYMENT_RECEIVED" || !transaction.client || !transaction.clientId) return apiError("A received client payment is required");
    if (transaction.invoice) return NextResponse.json({ invoice: transaction.invoice });
    const invoice = await prisma.invoice.create({ data: { invoiceNumber: `TT/INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`, transactionId: transaction.id, clientId: transaction.clientId, projectId: transaction.projectId, invoiceDate: new Date(), subtotal: transaction.amount, total: transaction.amount, currency: transaction.currency, billingSnapshot: { clientName: transaction.client.name, clientEmail: transaction.client.email }, generatedById: user.id, items: { create: { description: transaction.project?.name ?? "Services", quantity: 1, unitPrice: transaction.amount, lineTotal: transaction.amount } } } });
    await recordActivity({ activityType: "invoice.generated", actorUserId: user.id, entityType: "invoice", entityId: invoice.id, summary: `${user.fullName} generated ${invoice.invoiceNumber}.` });
    const delivery = transaction.client.email ? await sendEmail({ eventType: "invoice.generated", recipientEmail: transaction.client.email, recipientName: transaction.client.name, subject: `Invoice ${invoice.invoiceNumber}`, html: `<p>Your invoice ${invoice.invoiceNumber} has been generated.</p>`, entityType: "invoice", entityId: invoice.id, initiatedByUserId: user.id }) : { status: "SKIPPED" as const };
    return NextResponse.json({ invoice, storage: "deferred", delivery }, { status: 201 });
  } catch {
    return unknownApiError();
  }
}
