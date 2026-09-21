import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hasPermission } from "@/lib/auth/permissions";

export async function projectVisibilityWhere(userId: string): Promise<Prisma.ProjectWhereInput> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true, userRoles: { include: { role: true } } } });
  if (!user) return { id: "__missing__" };
  const roleNames = new Set([user.role.name, ...user.userRoles.map((assignment) => assignment.role.name)]);
  if (roleNames.has("CEO") || await hasPermission(userId, "project.view_all")) return { archivedAt: null };
  if (user.departmentId && (roleNames.has("CTO") || await hasPermission(userId, "project.view_department"))) return { archivedAt: null, departmentId: user.departmentId };
  return { archivedAt: null, OR: [
    { members: { some: { userId, status: "ACTIVE" } } },
    { projectOwnerUserId: userId },
    { managerUserId: userId },
    { technicalOwnerUserId: userId },
  ] };
}
