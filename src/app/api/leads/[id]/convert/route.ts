import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try { const user = await requirePermission("lead.convert"); const { id } = await context.params; const lead = await prisma.lead.findUniqueOrThrow({ where: { id }, include: { contacts: true } }); const client = await prisma.$transaction(async (tx) => { const created = await tx.client.create({ data: { clientCode: `TT-CLI-${Date.now()}`, name: lead.organizationName, email: lead.email, phone: lead.phone, originatingLeadId: lead.id, contacts: { create: { name: lead.primaryContactName, role: lead.primaryContactRole, email: lead.email, phone: lead.phone, isPrimary: true } } } }); await tx.lead.update({ where: { id }, data: { stage: "WON", wonAt: new Date() } }); return created; }); await recordActivity({ activityType: "lead.converted", actorUserId: user.id, entityType: "client", entityId: client.id, parentEntityType: "lead", parentEntityId: id, summary: `${user.fullName} converted “${lead.organizationName}” to client ${client.clientCode}.` }); return NextResponse.json({ client }, { status: 201 }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : unknownApiError(); }
}
