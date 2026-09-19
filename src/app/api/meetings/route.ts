import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { meetingCreateSchema } from "@/lib/validation/crm";

export async function GET() { try { await requirePermission("meeting.view"); const meetings = await prisma.meeting.findMany({ include: { lead: true, client: true, project: true }, orderBy: { scheduledStart: "asc" }, take: 100 }); return NextResponse.json({ meetings }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load meetings", 500); } }
export async function POST(request: Request) { try { const user = await requirePermission("meeting.create"); const input = meetingCreateSchema.parse(await request.json()); const meeting = await prisma.meeting.create({ data: { ...input, scheduledStart: new Date(input.scheduledStart), scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined, createdById: user.id } }); await recordActivity({ activityType: "meeting.created", actorUserId: user.id, entityType: "meeting", entityId: meeting.id, summary: `${user.fullName} scheduled “${meeting.title}”.` }); return NextResponse.json({ meeting }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid meeting data") : unknownApiError(); } }
