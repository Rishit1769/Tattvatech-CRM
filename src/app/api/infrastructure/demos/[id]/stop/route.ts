import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { apiError, unknownApiError } from "@/lib/api/response";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) { try { const user = await requirePermission("infrastructure.demo.stop"); const { id } = await context.params; const demo = await prisma.demoEnvironment.update({ where: { id }, data: { status: "STOPPED", stoppedAt: new Date() } }); await recordActivity({ activityType: "demo.stopped", actorUserId: user.id, entityType: "demo_environment", entityId: id, summary: `${user.fullName} stopped demo ${demo.templateKey}.` }); return NextResponse.json({ demo }); } catch { return unknownApiError(); } }
