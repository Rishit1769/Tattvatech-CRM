import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = env.SESSION_COOKIE_NAME;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function newToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { userId, sessionTokenHash: tokenHash, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({ where: { sessionTokenHash: hashToken(token) }, data: { revokedAt: new Date() } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export type CurrentUser = Pick<User, "id" | "fullName" | "email" | "status"> & {
  role: { id: string; name: string };
  roles: string[];
  department: string | null;
  financeAccess: boolean;
  forcePasswordChange: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: { sessionTokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() }, user: { status: "ACTIVE" } },
    include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } }, userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }, department: true } } },
  });
  const user = session?.user
    ? {
        id: session.user.id,
        fullName: session.user.fullName,
        email: session.user.email,
        status: session.user.status,
        role: { id: session.user.role.id, name: session.user.role.name },
        roles: [...new Map([[session.user.role.name, session.user.role.displayPriority], ...session.user.userRoles.map((assignment) => [assignment.role.name, assignment.role.displayPriority] as const)]).entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name),
        department: session.user.department?.name ?? null,
        financeAccess: [...session.user.role.permissions, ...session.user.userRoles.flatMap((assignment) => assignment.role.permissions)].some((item) => item.permission.key === "finance.view"),
        forcePasswordChange: session.user.forcePasswordChange,
      }
    : null;
  if (user) {
    await prisma.session.updateMany({ where: { sessionTokenHash: hashToken(token) }, data: { lastSeenAt: new Date() } });
  }
  return user;
}
