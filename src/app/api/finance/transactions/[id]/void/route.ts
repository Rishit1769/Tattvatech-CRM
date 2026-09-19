import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { recordAudit } from "@/lib/audit/service";
import { apiError, unknownApiError } from "@/lib/api/response";
import { voidTransactionSchema } from "@/lib/validation/crm";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const user = await requirePermission("finance.transaction.create"); const { id } = await context.params; const input = voidTransactionSchema.parse(await request.json()); const transaction = await prisma.transaction.update({ where: { id }, data: { status: "VOID", voidedAt: new Date(), voidedById: user.id, voidReason: input.reason } }); await recordActivity({ activityType: "transaction.voided", actorUserId: user.id, entityType: "transaction", entityId: id, summary: `${user.fullName} voided ${transaction.transactionNumber}.` }); await recordAudit({ actorUserId: user.id, action: "transaction.void", entityType: "transaction", entityId: id, after: { reason: input.reason } }); return NextResponse.json({ transaction }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("A void reason is required") : unknownApiError(); } }
