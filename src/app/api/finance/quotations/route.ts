import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requirePermission("finance.view");
    const quotations = await prisma.proposal.findMany({
      where: { status: { in: ["FINAL", "SENT", "ACCEPTED"] } },
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
