import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { leadCreateSchema } from "@/lib/validation/crm";

export async function GET(request: Request) {
  try {
    const user = await requirePermission("lead.view");
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const stage = url.searchParams.get("stage") as any;
    const leads = await prisma.lead.findMany({ where: { archivedAt: null, ...(stage ? { stage } : {}), ...(search ? { OR: [{ organizationName: { contains: search } }, { primaryContactName: { contains: search } }, { email: { contains: search } }] } : {}) }, include: { owner: { select: { fullName: true } }, _count: { select: { meetings: true, followUps: true } } }, orderBy: { updatedAt: "desc" }, take: 100 });
    return NextResponse.json({ leads, viewer: user.id });
  } catch (error) { return apiError(error instanceof Error && error.message === "UNAUTHENTICATED" ? "Authentication required" : "Forbidden", error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 403); }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("lead.create");
    const input = leadCreateSchema.parse(await request.json());
    const lead = await prisma.lead.create({ data: { ...input, email: input.email || null, ownerUserId: input.ownerUserId ?? user.id, expectedValue: input.expectedValue, createdById: user.id, stageHistory: { create: { toStage: "NEW", changedBy: user.id } } } });
    await recordActivity({ activityType: "lead.created", actorUserId: user.id, entityType: "lead", entityId: lead.id, summary: `${user.fullName} created lead “${lead.organizationName}”.` });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) { if (error instanceof Error && ["UNAUTHENTICATED", "FORBIDDEN"].includes(error.message)) return apiError(error.message === "UNAUTHENTICATED" ? "Authentication required" : "Forbidden", error.message === "UNAUTHENTICATED" ? 401 : 403); return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid lead data") : unknownApiError(); }
}
