import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    return NextResponse.json({ status: "ok", database: "ok", storage: "deferred", checkedAt });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable", storage: "deferred", checkedAt }, { status: 503 });
  }
}
