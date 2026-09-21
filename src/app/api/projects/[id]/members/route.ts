import { NextResponse } from "next/server";
import { requireAnyPermission, requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { projectVisibilityWhere } from "@/lib/projects/access";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try { await requireAnyPermission(["project.view", "project.view_all", "project.view_department", "project.view_assigned"]); const { id } = await context.params; const members = await prisma.projectMember.findMany({ where: { projectId: id, status: "ACTIVE" }, include: { user: { select: { id: true, fullName: true, email: true, role: { select: { name: true } }, department: true } }, mentor: { select: { fullName: true } } }, orderBy: { joinedAt: "asc" } }); return NextResponse.json({ members }); }
  catch (error) { return error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load project members", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const actor = await requirePermission("project.manage_members"); const { id } = await context.params; const body = await request.json() as { userId?: string; projectRole?: string; mentorUserId?: string }; if (!body.userId || !body.projectRole) return apiError("A user and project role are required"); const visibility = await projectVisibilityWhere(actor.id); const [project, user] = await Promise.all([prisma.project.findFirst({ where: { AND: [{ id }, visibility] } }), prisma.user.findUnique({ where: { id: body.userId } })]); if (!project) return apiError("You do not have permission to manage this project", 403); if (!user || user.status !== "ACTIVE") return apiError("The selected user cannot be assigned to this project"); const member = await prisma.projectMember.upsert({ where: { projectId_userId: { projectId: id, userId: body.userId } }, update: { projectRole: body.projectRole, mentorUserId: body.mentorUserId ?? null, status: "ACTIVE", leftAt: null }, create: { projectId: id, userId: body.userId, projectRole: body.projectRole, mentorUserId: body.mentorUserId } }); await recordActivity({ activityType: "project.member_added", actorUserId: actor.id, entityType: "project_member", entityId: member.id, parentEntityType: "project", parentEntityId: id, summary: `${actor.fullName} added ${user.fullName} to project ${project.projectCode}.` }); return NextResponse.json({ member }, { status: 201 }); }
  catch (error) { return error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : unknownApiError(); }
}
