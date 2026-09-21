import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";
import { recordActivity } from "@/lib/activity/service";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/config/env";
import { putPrivateObject, removePrivateObject } from "@/lib/storage/minio";

export async function GET() {
  try {
    await requirePermission("finance.view");
    const quotations = await prisma.proposal.findMany({
      where: { status: { in: ["FINALIZED", "FINAL", "SENT", "ACCEPTED"] } },
      include: { client: { select: { id: true, name: true, email: true } }, project: { select: { id: true, name: true } } },
      orderBy: [{ acceptedAt: "desc" }, { sentAt: "desc" }, { createdAt: "desc" }],
      take: 200,
    });
    return NextResponse.json({ quotations: quotations.map((quotation) => ({ ...quotation, amount: quotation.amount?.toString() ?? null })) });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return apiError("Authentication required", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403);
    return apiError("Unable to load final quotations", 500);
  }
}

export async function POST(request: Request) {
  let uploadedKey: string | null = null;
  try {
    const user = await requirePermission("finance.quotation.create");
    const form = await request.formData();
    const clientId = String(form.get("clientId") ?? "");
    const projectId = String(form.get("projectId") ?? "") || undefined;
    const title = String(form.get("title") ?? "").trim();
    const amount = Number(form.get("amount"));
    const expiresAtValue = String(form.get("expiresAt") ?? "");
    const file = form.get("document");
    if (!clientId || !title || !Number.isFinite(amount) || amount < 0 || !expiresAtValue || !(file instanceof File) || file.size === 0) return apiError("Client, title, amount, validity date, and a PDF are required");
    if (file.size > env.MAX_UPLOAD_BYTES) return apiError(`Quotation PDF exceeds the ${Math.round(env.MAX_UPLOAD_BYTES / 1024 / 1024)} MB upload limit`);
    const extension = file.name.toLowerCase().split(".").pop();
    if (file.type !== "application/pdf" || extension !== "pdf") return apiError("Final quotations must be uploaded as PDF files");
    const [client, project] = await Promise.all([prisma.client.findUnique({ where: { id: clientId } }), projectId ? prisma.project.findUnique({ where: { id: projectId } }) : Promise.resolve(null)]);
    if (!client) return apiError("The selected client was not found", 404);
    if (projectId && !project) return apiError("The selected project was not found", 404);
    const proposalId = randomUUID();
    const proposalNumber = `TT/QUO/${new Date().getUTCFullYear()}/${Date.now().toString().slice(-6)}`;
    const proposal = await prisma.proposal.create({ data: { id: proposalId, proposalNumber, title, clientId, projectId, amount, currency: "INR", status: "FINALIZED", expiresAt: new Date(`${expiresAtValue}T00:00:00.000Z`), createdById: user.id } });
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const filename = `${proposalNumber.replaceAll("/", "-")}.pdf`;
      const storage = await putPrivateObject({ objectKey: `quotations/${new Date().getUTCFullYear()}/${clientId}/${proposalNumber}/${filename}`, contentType: "application/pdf", body: bytes });
      uploadedKey = storage.objectKey;
      const storedFile = await prisma.storedFile.create({ data: { entityType: "QUOTATION", entityId: proposal.id, proposalId: proposal.id, originalFilename: file.name, objectKey: storage.objectKey, mimeType: "application/pdf", sizeBytes: bytes.length, bucketName: storage.bucketName, uploadedById: user.id } });
      const updated = await prisma.proposal.update({ where: { id: proposal.id }, data: { fileId: storedFile.id } });
      await recordActivity({ activityType: "quotation.created", actorUserId: user.id, entityType: "proposal", entityId: proposal.id, summary: `${user.fullName} created final quotation ${proposalNumber}.` });
      return NextResponse.json({ quotation: updated, document: { id: storedFile.id, filename: file.name, storage: "STORED" } }, { status: 201 });
    } catch (error) {
      if (uploadedKey) await removePrivateObject(uploadedKey).catch(() => undefined);
      await prisma.proposal.delete({ where: { id: proposal.id } }).catch(() => undefined);
      if (error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED") return apiError("Document storage is not configured. The quotation was not saved.", 503);
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return apiError("Authentication required", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403);
    return apiError("Unable to create final quotation", 500);
  }
}
