import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { resendEmail } from "@/lib/mail/service";
import { apiError, unknownApiError } from "@/lib/api/response";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) { try { const user = await requirePermission("activity.view"); const { id } = await context.params; const result = await resendEmail(id); return NextResponse.json({ ...result, initiatedBy: user.id }); } catch (error) { return error instanceof Error && error.message === "EMAIL_NOT_FOUND" ? apiError("Email event not found", 404) : unknownApiError(); } }
