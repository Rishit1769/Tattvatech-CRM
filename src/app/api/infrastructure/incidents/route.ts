import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { incidentCreateSchema } from "@/lib/validation/infrastructure";

export async function GET() { try { await requirePermission("infrastructure.view"); const incidents = await prisma.incident.findMany({ where: { status: { not: "RESOLVED" } }, include: { server: true }, orderBy: { detectedAt: "desc" }, take: 100 }); return NextResponse.json({ incidents }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : apiError("Unable to load incidents", 500); } }
export async function POST(request: Request) { try { const user = await requirePermission("infrastructure.incident.manage"); const input = incidentCreateSchema.parse(await request.json()); const incident = await prisma.incident.create({ data: { ...input, startedAt: new Date() } }); await recordActivity({ activityType: "incident.created", actorUserId: user.id, entityType: "incident", entityId: incident.id, summary: `${user.fullName} opened incident “${incident.title}”.` }); return NextResponse.json({ incident }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid incident data") : unknownApiError(); } }
