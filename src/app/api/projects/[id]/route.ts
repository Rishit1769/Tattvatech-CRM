import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) { try { await requirePermission("project.view"); const { id } = await context.params; const project = await prisma.project.findUnique({ where: { id }, include: { client: true, tasks: { orderBy: { createdAt: "desc" } }, milestones: { orderBy: { dueDate: "asc" } }, meetings: true, transactions: true, invoices: true } }); return project ? NextResponse.json({ project }) : apiError("Project not found", 404); } catch { return apiError("Unable to load project", 500); } }
