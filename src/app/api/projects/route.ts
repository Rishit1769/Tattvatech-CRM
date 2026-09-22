import { NextResponse } from "next/server";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { projectCreateSchema } from "@/lib/validation/crm";
import { projectVisibilityWhere } from "@/lib/projects/access";

export async function GET(request: Request) {
  try {
    const user = await requireAnyPermission(["project.view", "project.view_all", "project.view_department", "project.view_assigned"]);
    const query = new URL(request.url).searchParams;
    const lifecycle = query.get("lifecycle") as "PLANNING" | "DEVELOPMENT" | "TESTING" | "DEPLOYMENT" | "DEPLOYED" | null;
    const payment = query.get("payment") as "NOT_APPLICABLE" | "PENDING" | "PARTIALLY_PAID" | "PAID" | null;
    const search = query.get("search")?.trim();
    const assignedOnly = query.get("assigned") === "me";
    const projects = await prisma.project.findMany({ where: { AND: [await projectVisibilityWhere(user.id), assignedOnly ? { members: { some: { userId: user.id, status: "ACTIVE" } } } : {}, lifecycle ? { lifecycleStatus: lifecycle } : {}, payment ? { paymentStatus: payment } : {}, search ? { OR: [{ name: { contains: search } }, { projectCode: { contains: search } }, { client: { name: { contains: search } } }] } : {}] }, include: { client: true, family: true, department: true, owner: { select: { fullName: true } }, manager: { select: { fullName: true } }, technicalOwner: { select: { fullName: true } }, _count: { select: { tasks: true, milestones: true, members: true, modules: true } } }, orderBy: { updatedAt: "desc" }, take: 100 });
    return NextResponse.json({ projects: projects.map((project) => ({ ...project, dealValue: project.dealValue?.toString() ?? null })) });
  } catch (error) {
    return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load projects", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAnyPermission(["project.create"]);
    const input = projectCreateSchema.parse(await request.json());
    const family = await prisma.projectFamily.findUnique({ where: { id: input.familyId ?? "" } }) ?? await prisma.projectFamily.findUnique({ where: { code: "6" } });
    if (!family) return apiError("A project family is required before creating a project");
    if (input.projectType === "CLIENT_PROJECT" && !input.clientId) return apiError("A client is required for client projects");
    const project = await prisma.$transaction(async (tx) => {
      const existing = await tx.project.findMany({ where: { familyId: family.id }, select: { projectCode: true } });
      const next = existing.reduce((maximum, item) => { const suffix = Number(item.projectCode.split(".").at(-1)); return Number.isInteger(suffix) ? Math.max(maximum, suffix) : maximum; }, 0) + 1;
      return tx.project.create({ data: { ...input, familyId: family.id, clientId: input.clientId, projectCode: `${family.code}.${next}`, startDate: input.startDate ? new Date(`${input.startDate}T00:00:00Z`) : undefined, expectedDeliveryDate: input.expectedDeliveryDate ? new Date(`${input.expectedDeliveryDate}T00:00:00Z`) : undefined, repositoryUrl: input.repositoryUrl || null, createdById: user.id }, include: { family: true, department: true, client: true } });
    }, { isolationLevel: "Serializable" });
    await recordActivity({ activityType: "project.created", actorUserId: user.id, entityType: "project", entityId: project.id, summary: `${user.fullName} created project “${project.projectCode} ${project.name}”.` });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") return apiError("Invalid project data");
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return apiError("Authentication required", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403);
    return unknownApiError();
  }
}
