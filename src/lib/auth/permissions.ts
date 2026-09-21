import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const result = await prisma.rolePermission.findFirst({ where: { permission: { key: permissionKey }, OR: [
    { role: { legacyUsers: { some: { id: userId, status: "ACTIVE" } } } },
    { role: { userRoles: { some: { user: { id: userId, status: "ACTIVE" } } } } },
  ] } });
  return Boolean(result);
}

export async function requirePermission(permissionKey: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!(await hasPermission(String(user.id), permissionKey))) throw new Error("FORBIDDEN");
  return user;
}

export async function requireAnyPermission(permissionKeys: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  for (const permissionKey of permissionKeys) if (await hasPermission(String(user.id), permissionKey)) return user;
  throw new Error("FORBIDDEN");
}
