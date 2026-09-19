import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";

export async function GET() { try { await requirePermission("activity.view"); const emailEvents = await prisma.emailEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); return NextResponse.json({ emailEvents }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : apiError("Unable to load email events", 500); } }
