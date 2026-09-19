import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const result = await prisma.rolePermission.findFirst({ where: { role: { users: { some: { id: userId, status: "ACTIVE" } } }, permission: { key: permissionKey } } });
  return Boolean(result);
}

export async function requirePermission(permissionKey: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!(await hasPermission(String(user.id), permissionKey))) throw new Error("FORBIDDEN");
  return user;
}
