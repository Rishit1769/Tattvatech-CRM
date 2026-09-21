import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const valid = user ? await verifyPassword(input.password, user.passwordHash) : false;
    if (!user || !valid || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession(String(user.id));
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return NextResponse.json({ ok: true, forcePasswordChange: user.forcePasswordChange });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
