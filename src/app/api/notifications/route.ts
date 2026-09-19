import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";

export async function GET() { const user = await getCurrentUser(); if (!user) return apiError("Authentication required", 401); const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }); return NextResponse.json({ notifications }); }
export async function PATCH(request: Request) { const user = await getCurrentUser(); if (!user) return apiError("Authentication required", 401); const body = await request.json() as { id?: string }; if (!body.id) return apiError("Notification id is required"); const notification = await prisma.notification.updateMany({ where: { id: body.id, userId: user.id }, data: { readAt: new Date() } }); return NextResponse.json({ updated: notification.count }); }
