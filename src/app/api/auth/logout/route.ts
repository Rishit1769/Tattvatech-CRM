import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await revokeCurrentSession();
  } catch {
    // The cookie is still cleared by the session helper when possible.
  }
  return NextResponse.json({ ok: true });
}
