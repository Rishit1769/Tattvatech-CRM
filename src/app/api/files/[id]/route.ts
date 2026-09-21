import { NextResponse } from "next/server";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getPrivateObjectUrl } from "@/lib/storage/minio";
import { apiError } from "@/lib/api/response";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAnyPermission(["finance.view", "finance.transaction.view", "finance.invoice.view", "finance.quotation.view", "project.upload_documents"]);
    const { id } = await context.params;
    const file = await prisma.storedFile.findUnique({ where: { id } });
    if (!file) return apiError("Document not found", 404);
    return NextResponse.json({ file: { id: file.id, originalFilename: file.originalFilename, mimeType: file.mimeType, sizeBytes: file.sizeBytes, url: await getPrivateObjectUrl(file.objectKey) } });
  } catch (error) { return error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED" ? apiError("Document storage is not configured", 503) : apiError("Unable to access document", 500); }
}
