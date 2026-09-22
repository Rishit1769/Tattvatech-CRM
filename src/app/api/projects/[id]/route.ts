import { NextResponse } from "next/server";
import { hasPermission, requireAnyPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";
import { projectVisibilityWhere } from "@/lib/projects/access";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAnyPermission(["project.view", "project.view_all", "project.view_department", "project.view_assigned"]);
    const canViewCommercial = await hasPermission(user.id, "finance.project.view_commercial");
    const { id } = await context.params;
    const visibility = await projectVisibilityWhere(user.id);
    const project = await prisma.project.findFirst({ where: { AND: [{ id }, visibility] }, include: { client: true, family: true, department: true, owner: { select: { fullName: true, email: true } }, manager: { select: { fullName: true, email: true } }, technicalOwner: { select: { fullName: true, email: true } }, members: { where: { status: "ACTIVE" }, include: { user: { select: { fullName: true, email: true, role: { select: { name: true } } } } } }, modules: { include: { _count: { select: { tasks: true } } }, orderBy: { sortOrder: "asc" } }, statusHistory: { include: { changedBy: { select: { fullName: true } } }, orderBy: { changedAt: "desc" }, take: 30 }, deployments: { include: { deployedBy: { select: { fullName: true } }, server: true }, orderBy: { createdAt: "desc" }, take: 30 }, tasks: { orderBy: { createdAt: "desc" }, take: 100 }, milestones: { orderBy: { dueDate: "asc" } }, meetings: true, transactions: true, invoices: true } });
    if (!project) return apiError("You do not have permission to access this project", 403);
    const activeTasks = project.tasks.filter((task) => task.status !== "CANCELLED");
    const progress = activeTasks.length ? Math.round(activeTasks.filter((task) => task.status === "DONE").length / activeTasks.length * 100) : null;
    const safeProject = canViewCommercial ? project : (() => { const { transactions: _transactions, invoices: _invoices, dealValue: _dealValue, paymentStructureNotes: _paymentStructureNotes, expectedPaymentAmount: _expectedPaymentAmount, paymentDueDate: _paymentDueDate, ...rest } = project; return rest; })();
    return NextResponse.json({ project: { ...safeProject, dealValue: canViewCommercial ? project.dealValue?.toString() ?? null : undefined, progress } });
  } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load project", 500); }
}
