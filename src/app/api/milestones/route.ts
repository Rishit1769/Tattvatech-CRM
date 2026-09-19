import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { milestoneCreateSchema } from "@/lib/validation/crm";

export async function POST(request: Request) { try { const user = await requirePermission("project.create"); const input = milestoneCreateSchema.parse(await request.json()); const milestone = await prisma.milestone.create({ data: { ...input, dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00Z`) : undefined, paymentAmount: input.paymentAmount, paymentPercentage: input.paymentPercentage } }); await recordActivity({ activityType: "milestone.created", actorUserId: user.id, entityType: "milestone", entityId: milestone.id, parentEntityType: "project", parentEntityId: milestone.projectId, summary: `${user.fullName} created milestone “${milestone.title}”.` }); return NextResponse.json({ milestone }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid milestone data") : unknownApiError(); } }
