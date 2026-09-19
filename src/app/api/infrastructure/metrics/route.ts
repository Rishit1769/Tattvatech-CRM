import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError, unknownApiError } from "@/lib/api/response";
import { metricCreateSchema } from "@/lib/validation/infrastructure";

export async function POST(request: Request) { try { await requirePermission("infrastructure.manage"); const input = metricCreateSchema.parse(await request.json()); const metric = await prisma.serverMetric.create({ data: input }); const cpuAlert = metric.cpuPercent !== null && metric.cpuPercent !== undefined && Number(metric.cpuPercent) > 85; return NextResponse.json({ metric, alerts: cpuAlert ? [{ severity: "WARNING", message: "CPU is above 85%" }] : [] }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid metric data") : unknownApiError(); } }
