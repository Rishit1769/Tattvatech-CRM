import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { leadPatchSchema } from "@/lib/validation/crm";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try { await requirePermission("lead.view"); const { id } = await context.params; const lead = await prisma.lead.findUnique({ where: { id }, include: { stageHistory: { orderBy: { createdAt: "desc" } }, meetings: true, followUps: { orderBy: { dueAt: "asc" } }, proposals: true, owner: { select: { fullName: true, email: true } } } }); return lead ? NextResponse.json({ lead }) : apiError("Lead not found", 404); } catch { return apiError("Unable to load lead", 500); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const user = await requirePermission("lead.edit"); const { id } = await context.params; const input = leadPatchSchema.parse(await request.json()); const lead = await prisma.lead.update({ where: { id }, data: { ...input, email: input.email || null, expectedValue: input.expectedValue } }); await recordActivity({ activityType: "lead.updated", actorUserId: user.id, entityType: "lead", entityId: id, summary: `${user.fullName} updated lead “${lead.organizationName}”.` }); return NextResponse.json({ lead }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid lead data") : unknownApiError(); }
}
