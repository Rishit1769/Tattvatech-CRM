import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { taskCreateSchema } from "@/lib/validation/crm";
import { projectVisibilityWhere } from "@/lib/projects/access";

export async function POST(request: Request) { try { const user = await requirePermission("task.create"); const input = taskCreateSchema.parse(await request.json()); const project = await prisma.project.findFirst({ where: { AND: [{ id: input.projectId }, await projectVisibilityWhere(user.id)] } }); if (!project) return apiError("You do not have permission to add work to this project", 403); const task = await prisma.task.create({ data: { ...input, startDate: input.startDate ? new Date(`${input.startDate}T00:00:00Z`) : undefined, dueAt: input.dueAt ? new Date(input.dueAt) : undefined, createdById: user.id } }); await recordActivity({ activityType: "task.created", actorUserId: user.id, entityType: "task", entityId: task.id, parentEntityType: "project", parentEntityId: task.projectId, summary: `${user.fullName} created task “${task.title}”.` }); return NextResponse.json({ task }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid task data") : unknownApiError(); } }
