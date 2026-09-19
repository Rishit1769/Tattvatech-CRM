import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db, type DbRow } from "@/lib/db/pool";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const [rows] = await db.execute<DbRow[]>(
      `SELECT id, password_hash, status FROM users WHERE email = ? LIMIT 1`,
      [input.email],
    );
    const user = rows[0];
    const valid = user ? await verifyPassword(input.password, String(user.password_hash)) : false;
    if (!user || !valid || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession(String(user.id));
    await db.execute("UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?", [user.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
