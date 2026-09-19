import { NextResponse } from "next/server";
import { db } from "@/lib/db/pool";

export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    await db.query("SELECT 1 AS ok");
    return NextResponse.json({ status: "ok", database: "ok", storage: "deferred", checkedAt });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable", storage: "deferred", checkedAt }, { status: 503 });
  }
}
