import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { recordAudit } from "@/lib/audit/service";
import { notifyProjectEvent, findCtoRecipients } from "@/lib/notifications/project-events";
import { financeProjectCreateSchema } from "@/lib/validation/crm";
import { apiError, unknownApiError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("finance.project.create");
    const input = financeProjectCreateSchema.parse(await request.json());
    if (input.projectType === "CLIENT_PROJECT" && !input.clientId) return apiError("An existing client is required for client projects");
    const family = await prisma.projectFamily.findUnique({ where: { id: input.familyId ?? "" } }) ?? await prisma.projectFamily.findUnique({ where: { code: "6" } });
    if (!family) return apiError("A project family is required before creating a project");
    const client = input.clientId ? await prisma.client.findUnique({ where: { id: input.clientId } }) : null;
    if (input.clientId && !client) return apiError("The selected client was not found", 404);
    const project = await prisma.$transaction(async (tx) => {
      const existing = await tx.project.findMany({ where: { familyId: family.id }, select: { projectCode: true } });
      const next = existing.reduce((maximum, item) => { const suffix = Number(item.projectCode.split(".").at(-1)); return Number.isInteger(suffix) ? Math.max(maximum, suffix) : maximum; }, 0) + 1;
      const created = await tx.project.create({ data: { name: input.name, familyId: family.id, clientId: input.clientId, projectType: input.projectType, departmentId: input.departmentId, type: input.type, description: input.description, dealValue: input.dealValue, expectedPaymentAmount: input.expectedPaymentAmount ?? input.dealValue, paymentDueDate: input.paymentDueDate ? new Date(`${input.paymentDueDate}T00:00:00Z`) : undefined, paymentStructureNotes: input.paymentStructureNotes ?? input.commercialNotes, startDate: input.startDate ? new Date(`${input.startDate}T00:00:00Z`) : undefined, expectedDeliveryDate: input.expectedDeliveryDate ? new Date(`${input.expectedDeliveryDate}T00:00:00Z`) : undefined, priority: input.priority, projectCode: `${family.code}.${next}`, createdById: actor.id }, include: { family: true, client: true } });
      const ctos = await tx.user.findMany({ where: { status: "ACTIVE", OR: [{ role: { name: "CTO" } }, { userRoles: { some: { role: { name: "CTO" } } } }] }, select: { id: true } });
      if (ctos.length) await tx.notification.createMany({ data: ctos.map((cto) => ({ userId: cto.id, type: "PROJECT_CREATED", title: "New project", body: `${created.name} was created by Finance and is ready for technical planning.`, targetUrl: `/roles/cto/projects/${created.id}` })) });
      return created;
    });
    await recordActivity({ activityType: "project.created", actorUserId: actor.id, entityType: "project", entityId: project.id, summary: `${actor.fullName} created project “${project.projectCode} ${project.name}” from Finance.`, metadata: { lifecycleStatus: "PLANNING", clientId: project.clientId } });
    await recordAudit({ actorUserId: actor.id, action: "finance.project.create", entityType: "project", entityId: project.id, after: { projectCode: project.projectCode, lifecycleStatus: "PLANNING", clientId: project.clientId } });
    const ctos = await findCtoRecipients();
    void notifyProjectEvent({ projectId: project.id, projectName: project.name, projectCode: project.projectCode, clientName: project.client?.name ?? "Internal project", targetUrl: `/roles/cto/projects/${project.id}`, actorName: actor.fullName, recipients: ctos, eventType: "PROJECT_CREATED", skipNotification: true }).catch(() => undefined);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) { if (error && typeof error === "object" && "name" in error && error.name === "ZodError") return apiError("Invalid project data"); if (error instanceof Error && error.message === "UNAUTHENTICATED") return apiError("Authentication required", 401); if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403); return unknownApiError(); }
}
