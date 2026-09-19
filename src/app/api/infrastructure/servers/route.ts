import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { serverCreateSchema } from "@/lib/validation/infrastructure";

export async function GET() { try { await requirePermission("infrastructure.view"); const servers = await prisma.server.findMany({ where: { active: true }, include: { services: true, metrics: { orderBy: { capturedAt: "desc" }, take: 1 }, _count: { select: { incidents: true } } }, orderBy: { name: "asc" } }); return NextResponse.json({ servers }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load servers", 500); } }
export async function POST(request: Request) { try { const user = await requirePermission("infrastructure.manage"); const input = serverCreateSchema.parse(await request.json()); const server = await prisma.server.create({ data: input }); await recordActivity({ activityType: "server.created", actorUserId: user.id, entityType: "server", entityId: server.id, summary: `${user.fullName} registered server “${server.name}”.` }); return NextResponse.json({ server }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid server data") : unknownApiError(); } }
