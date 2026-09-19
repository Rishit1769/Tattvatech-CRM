import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { stageSchema } from "@/lib/validation/crm";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const user = await requirePermission("lead.edit"); const { id } = await context.params; const input = stageSchema.parse(await request.json()); const current = await prisma.lead.findUniqueOrThrow({ where: { id } }); if (input.stage === "LOST" && !input.lostReason) return apiError("A lost reason is required"); const lead = await prisma.$transaction(async (tx) => { const updated = await tx.lead.update({ where: { id }, data: { stage: input.stage, lostReason: input.lostReason, wonAt: input.stage === "WON" ? new Date() : undefined } }); await tx.leadStageHistory.create({ data: { leadId: id, fromStage: current.stage, toStage: input.stage, changedBy: user.id, note: input.note } }); return updated; }); await recordActivity({ activityType: "lead.stage_changed", actorUserId: user.id, entityType: "lead", entityId: id, summary: `${user.fullName} moved “${lead.organizationName}” from ${current.stage} to ${lead.stage}.`, metadata: { from: current.stage, to: lead.stage } }); return NextResponse.json({ lead }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid stage change") : unknownApiError(); }
}
