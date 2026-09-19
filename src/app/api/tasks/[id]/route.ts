import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { taskPatchSchema } from "@/lib/validation/crm";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { try { const user = await requirePermission("task.create"); const { id } = await context.params; const input = taskPatchSchema.parse(await request.json()); const task = await prisma.task.update({ where: { id }, data: { ...input, completedAt: input.status === "DONE" ? new Date() : undefined } }); await recordActivity({ activityType: "task.updated", actorUserId: user.id, entityType: "task", entityId: id, parentEntityType: "project", parentEntityId: task.projectId, summary: `${user.fullName} updated task “${task.title}”.` }); return NextResponse.json({ task }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid task data") : unknownApiError(); } }
