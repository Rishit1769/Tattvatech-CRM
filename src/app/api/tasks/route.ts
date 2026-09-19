import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { taskCreateSchema } from "@/lib/validation/crm";

export async function POST(request: Request) { try { const user = await requirePermission("task.create"); const input = taskCreateSchema.parse(await request.json()); const task = await prisma.task.create({ data: { ...input, dueAt: input.dueAt ? new Date(input.dueAt) : undefined, createdById: user.id } }); await recordActivity({ activityType: "task.created", actorUserId: user.id, entityType: "task", entityId: task.id, parentEntityType: "project", parentEntityId: task.projectId, summary: `${user.fullName} created task “${task.title}”.` }); return NextResponse.json({ task }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid task data") : unknownApiError(); } }
