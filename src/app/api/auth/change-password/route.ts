import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { changePasswordSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const input = changePasswordSchema.parse(await request.json());

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await verifyPassword(input.currentPassword, fullUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const passwordHash = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, forcePasswordChange: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      const zodErr = error as unknown as { issues: Array<{ message: string }> };
      const message = zodErr.issues?.[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to change password" }, { status: 500 });
  }
}
