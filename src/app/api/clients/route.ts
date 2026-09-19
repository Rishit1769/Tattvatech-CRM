import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { clientCreateSchema } from "@/lib/validation/crm";

export async function GET() { try { await requirePermission("client.view"); const clients = await prisma.client.findMany({ where: { archivedAt: null }, include: { contacts: true, _count: { select: { projects: true, meetings: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }); return NextResponse.json({ clients }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load clients", 500); } }
export async function POST(request: Request) { try { const user = await requirePermission("client.create"); const input = clientCreateSchema.parse(await request.json()); const client = await prisma.client.create({ data: { ...input, email: input.email || null, clientCode: `TT-CLI-${Date.now()}` } }); await recordActivity({ activityType: "client.created", actorUserId: user.id, entityType: "client", entityId: client.id, summary: `${user.fullName} created client “${client.name}”.` }); return NextResponse.json({ client }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid client data") : unknownApiError(); } }
