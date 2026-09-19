import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError, unknownApiError } from "@/lib/api/response";
import { serviceCreateSchema } from "@/lib/validation/infrastructure";

export async function GET() { try { await requirePermission("infrastructure.view"); const services = await prisma.service.findMany({ include: { server: true }, orderBy: [{ isCore: "desc" }, { name: "asc" }] }); return NextResponse.json({ services }); } catch (error) { return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : apiError("Unable to load services", 500); } }
export async function POST(request: Request) { try { await requirePermission("infrastructure.manage"); const input = serviceCreateSchema.parse(await request.json()); const service = await prisma.service.create({ data: input }); return NextResponse.json({ service }, { status: 201 }); } catch (error) { return error && typeof error === "object" && "name" in error && error.name === "ZodError" ? apiError("Invalid service data") : unknownApiError(); } }
