import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { sendEmail } from "@/lib/mail/service";
import { apiError, unknownApiError } from "@/lib/api/response";

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
    const body = await request.json() as { transactionId?: string };
    if (!body.transactionId) return apiError("A transaction is required");
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
