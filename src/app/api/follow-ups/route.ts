import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { followUpCreateSchema } from "@/lib/validation/crm";

export async function GET() { try { await requirePermission("follow_up.view"); const followUps = await prisma.followUp.findMany({ where: { status: "OPEN" }, include: { lead: true, client: true }, orderBy: { dueAt: "asc" }, take: 100 }); return NextResponse.json({ followUps }); } catch { return apiError("Unable to load follow-ups", 500); } }
export async function POST(request: Request) { try { const user = await requirePermission("follow_up.create"); const input = followUpCreateSchema.parse(await request.json()); const followUp = await prisma.followUp.create({ data: { ...input, dueAt: new Date(input.dueAt), assignedUserId: input.assignedUserId ?? user.id, createdById: user.id } }); await recordActivity({ activityType: "follow_up.created", actorUserId: user.id, entityType: "follow_up", entityId: followUp.id, summary: `${user.fullName} created follow-up “${followUp.title}”.` }); return NextResponse.json({ followUp }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid follow-up data") : unknownApiError(); } }
