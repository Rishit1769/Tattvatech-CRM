import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hasPermission, requireAnyPermission, requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { recordAudit } from "@/lib/audit/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { transactionCreateSchema } from "@/lib/validation/crm";
import { env } from "@/lib/config/env";
import { putPrivateObject, removePrivateObject } from "@/lib/storage/minio";

const allowedDocuments = new Map([["application/pdf", "pdf"], ["image/jpeg", "jpg"], ["image/png", "png"]]);
function safeFilename(value: string) { return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "supporting-document"; }

export async function GET() { try { await requireAnyPermission(["finance.view", "finance.transaction.view"]); const transactions = await prisma.transaction.findMany({ include: { client: true, project: true, invoice: true, documents: true }, orderBy: { transactionDate: "desc" }, take: 200 }); return NextResponse.json({ transactions }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load transactions", 500); } }

export async function POST(request: Request) {
  let uploadedKey: string | null = null;
  try {
    const user = await requirePermission("finance.transaction.create");
    const contentType = request.headers.get("content-type") ?? "";
    let input: ReturnType<typeof transactionCreateSchema.parse>;
    let document: { bytes: Buffer; filename: string; mimeType: string } | null = null;
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      input = transactionCreateSchema.parse({ type: form.get("type"), clientId: form.get("clientId") || undefined, projectId: form.get("projectId") || undefined, amount: form.get("amount"), currency: form.get("currency") || "INR", paymentMethod: form.get("paymentMethod") || undefined, transactionDate: form.get("transactionDate"), referenceNumber: form.get("referenceNumber") || undefined, description: form.get("description") || undefined });
      const file = form.get("document");
      if (file instanceof File && file.size > 0) {
        if (!(await hasPermission(user.id, "finance.transaction.attach_document"))) return apiError("You do not have permission to attach transaction documents", 403);
        if (file.size > env.MAX_UPLOAD_BYTES) return apiError(`Document exceeds the ${Math.round(env.MAX_UPLOAD_BYTES / 1024 / 1024)} MB upload limit`);
        const extension = file.name.toLowerCase().split(".").pop();
        if (!allowedDocuments.has(file.type) || !extension || !["pdf", "jpg", "jpeg", "png"].includes(extension)) return apiError("Only PDF, JPEG, JPG, and PNG documents are supported");
        document = { bytes: Buffer.from(await file.arrayBuffer()), filename: safeFilename(file.name), mimeType: file.type };
      }
    } else input = transactionCreateSchema.parse(await request.json());
    if (input.type === "PAYMENT_RECEIVED" && !input.clientId) return apiError("A client is required for received payments");
    const transactionId = randomUUID();
    const transactionNumber = `TT-TXN-${new Date().getUTCFullYear()}-${Date.now().toString().slice(-6)}`;
    const { generateInvoice: _generateInvoice, ...transactionData } = input;
    const transaction = await prisma.transaction.create({ data: { id: transactionId, ...transactionData, transactionNumber, transactionDate: new Date(`${input.transactionDate}T00:00:00Z`), recordedById: user.id, currency: input.currency.toUpperCase() } });
    try {
      let fileRecord = null;
      if (document) {
        const objectKey = `transactions/${new Date().getUTCFullYear()}/${String(new Date().getUTCMonth() + 1).padStart(2, "0")}/${transactionNumber}/${document.filename}`;
        const stored = await putPrivateObject({ objectKey, contentType: document.mimeType, body: document.bytes });
        uploadedKey = stored.objectKey;
        fileRecord = await prisma.storedFile.create({ data: { entityType: "TRANSACTION", entityId: transaction.id, transactionId: transaction.id, originalFilename: document.filename, objectKey: stored.objectKey, mimeType: document.mimeType, sizeBytes: document.bytes.length, bucketName: stored.bucketName, uploadedById: user.id } });
        await recordActivity({ activityType: "transaction.document_uploaded", actorUserId: user.id, entityType: "file", entityId: fileRecord.id, parentEntityType: "transaction", parentEntityId: transaction.id, summary: `${user.fullName} attached ${document.filename} to ${transaction.transactionNumber}.` });
      }
      await recordActivity({ activityType: "transaction.recorded", actorUserId: user.id, entityType: "transaction", entityId: transaction.id, summary: `${user.fullName} recorded ${transaction.type} ${transaction.currency} ${transaction.amount}.` });
      await recordAudit({ actorUserId: user.id, action: "transaction.create", entityType: "transaction", entityId: transaction.id, after: { type: transaction.type, amount: transaction.amount.toString(), documentAttached: Boolean(document) } });
      return NextResponse.json({ transaction, documentAttached: Boolean(document) }, { status: 201 });
    } catch (error) {
      if (uploadedKey) await removePrivateObject(uploadedKey).catch(() => undefined);
      await prisma.transaction.delete({ where: { id: transaction.id } }).catch(() => undefined);
      if (error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED") return apiError("Document storage is not configured. The transaction was not saved.", 503);
      throw error;
    }
  } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid transaction data") : error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : unknownApiError(); }
}
