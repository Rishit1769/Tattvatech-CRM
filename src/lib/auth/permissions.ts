import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/pool";

export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const [rows] = await db.execute(
    `SELECT 1
     FROM users u
     INNER JOIN role_permissions rp ON rp.role_id = u.role_id
     INNER JOIN permissions p ON p.id = rp.permission_id
     WHERE u.id = ? AND u.status = 'ACTIVE' AND p.permission_key = ?
     LIMIT 1`,
    [userId, permissionKey],
  );
  return Array.isArray(rows) && rows.length > 0;
}

export async function requirePermission(permissionKey: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!(await hasPermission(String(user.id), permissionKey))) throw new Error("FORBIDDEN");
  return user;
}
