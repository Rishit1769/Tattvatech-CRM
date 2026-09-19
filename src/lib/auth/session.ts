import crypto from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import { db, type DbRow } from "@/lib/db/pool";

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

  await db.execute(
    `INSERT INTO sessions (id, user_id, session_token_hash, created_at, expires_at, last_seen_at)
     VALUES (UUID(), ?, ?, UTC_TIMESTAMP(), ?, UTC_TIMESTAMP())`,
    [userId, tokenHash, expiresAt],
  );

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
    await db.execute("UPDATE sessions SET revoked_at = UTC_TIMESTAMP() WHERE session_token_hash = ?", [hashToken(token)]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<DbRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [rows] = await db.execute<DbRow[]>(
    `SELECT u.id, u.full_name, u.email, u.status, r.id AS role_id, r.name AS role_name
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     INNER JOIN roles r ON r.id = u.role_id
     WHERE s.session_token_hash = ?
       AND s.revoked_at IS NULL
       AND s.expires_at > UTC_TIMESTAMP()
       AND u.status = 'ACTIVE'
     LIMIT 1`,
    [hashToken(token)],
  );

  const user = rows[0] ?? null;
  if (user) {
    await db.execute("UPDATE sessions SET last_seen_at = UTC_TIMESTAMP() WHERE session_token_hash = ?", [hashToken(token)]);
  }
  return user;
}
