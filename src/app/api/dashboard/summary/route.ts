import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";
import { projectVisibilityWhere } from "@/lib/projects/access";

export async function GET() {
  try {
    const user = await requirePermission("dashboard.view");
    const projectScope = await projectVisibilityWhere(user.id);
    const [activeLeads, pipeline, activeProjects, received, openIncidents, runningDemos, planningProjects, developmentProjects, testingProjects, deploymentProjects, paymentPendingProjects, paymentReceivedProjects, deployedProjects] = await Promise.all([
      prisma.lead.count({ where: { archivedAt: null, stage: { notIn: ["WON", "LOST"] } } }),
      prisma.lead.aggregate({ where: { archivedAt: null, stage: { notIn: ["WON", "LOST"] } }, _sum: { expectedValue: true } }),
      prisma.project.count({ where: { AND: [projectScope, { status: { in: ["PLANNING", "ACTIVE", "BLOCKED", "WAITING_CLIENT", "ON_HOLD"] } }] } }),
      prisma.transaction.aggregate({ where: { type: "PAYMENT_RECEIVED", status: { not: "VOID" } }, _sum: { amount: true } }),
      prisma.incident.count({ where: { status: { not: "RESOLVED" } } }),
      prisma.demoEnvironment.count({ where: { status: { in: ["REQUESTED", "STARTING", "RUNNING"] } } }),
      prisma.project.count({ where: { AND: [projectScope, { lifecycleStatus: "PLANNING" }] } }),
      prisma.project.count({ where: { AND: [projectScope, { lifecycleStatus: "DEVELOPMENT" }] } }),
      prisma.project.count({ where: { AND: [projectScope, { lifecycleStatus: "TESTING" }] } }),
      prisma.project.count({ where: { AND: [projectScope, { lifecycleStatus: { in: ["DEPLOYMENT", "DEPLOYED"] } }] } }),
      prisma.project.count({ where: { AND: [projectScope, { paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] } }] } }),
      prisma.project.count({ where: { AND: [projectScope, { paymentStatus: "PAID" }] } }),
      prisma.project.findMany({ where: { AND: [projectScope, { lifecycleStatus: { in: ["DEPLOYMENT", "DEPLOYED"] }, deployments: { some: { status: "ACTIVE" } } }] }, include: { client: true, technicalOwner: { select: { fullName: true } }, deployments: { where: { status: "ACTIVE" }, orderBy: { deployedAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 50 }),
    ]);
    return NextResponse.json({ activeLeads, pipelineValue: pipeline._sum.expectedValue?.toString() ?? null, activeProjects, received: received._sum.amount?.toString() ?? null, openIncidents, runningDemos, lifecycle: { planning: planningProjects, development: developmentProjects, testing: testingProjects, deployment: deploymentProjects, deployed: deployedProjects.length, paymentPending: paymentPendingProjects, paymentReceived: paymentReceivedProjects }, deployedProjects });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return apiError("Authentication required", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Forbidden", 403);
    return apiError("Unable to load dashboard", 500);
  }
}
