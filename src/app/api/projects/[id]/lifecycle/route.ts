import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { recordAudit } from "@/lib/audit/service";
import { apiError, unknownApiError } from "@/lib/api/response";

const stages = ["PLANNING", "DEVELOPMENT", "TESTING", "DEPLOYMENT"] as const;
type LifecycleStage = typeof stages[number];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("project.lifecycle.manage");
    const { id } = await context.params;
    const body = await request.json() as { status?: string; note?: string; environment?: string; deploymentUrl?: string; serverId?: string; version?: string; commitReference?: string; deploymentDate?: string; expectedPaymentAmount?: number; paymentDueDate?: string };
    if (!body.status || !stages.includes(body.status as LifecycleStage)) return apiError("Invalid project lifecycle stage");
    if (body.status === "DEPLOYMENT" && (!body.environment || !body.deploymentUrl || !body.deploymentDate)) return apiError("Environment, deployment URL, and deployment date are required before entering deployment");
    const current = await prisma.project.findUnique({ where: { id } });
    if (!current) return apiError("Project not found", 404);
    if (current.lifecycleStatus === body.status) return NextResponse.json({ project: current });
    const updated = await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({ where: { id }, data: { lifecycleStatus: body.status as LifecycleStage, expectedPaymentAmount: body.expectedPaymentAmount, paymentDueDate: body.paymentDueDate ? new Date(`${body.paymentDueDate}T00:00:00Z`) : undefined, paymentStatus: body.status === "DEPLOYMENT" ? "PENDING" : undefined } });
      await tx.projectStatusHistory.create({ data: { projectId: id, previousStatus: current.lifecycleStatus, newStatus: project.lifecycleStatus, changedById: user.id, note: body.note } });
      if (body.status === "DEPLOYMENT") await tx.deployment.create({ data: { projectId: id, environment: body.environment!, status: "ACTIVE", deploymentUrl: body.deploymentUrl, serverId: body.serverId, version: body.version, commitReference: body.commitReference, deployedById: user.id, deployedAt: new Date(body.deploymentDate!), healthStatus: "UNKNOWN", lastHealthCheckAt: new Date(), notes: body.note } });
      return project;
    });
    await recordActivity({ activityType: "project.lifecycle_changed", actorUserId: user.id, entityType: "project", entityId: id, summary: `${user.fullName} changed ${current.projectCode} from ${current.lifecycleStatus} to ${updated.lifecycleStatus}.`, metadata: { previousStatus: current.lifecycleStatus, newStatus: updated.lifecycleStatus } });
    await recordAudit({ actorUserId: user.id, action: "project.lifecycle.change", entityType: "project", entityId: id, before: { lifecycleStatus: current.lifecycleStatus }, after: { lifecycleStatus: updated.lifecycleStatus } });
    return NextResponse.json({ project: updated });
  } catch (error) { return error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : unknownApiError(); }
}
