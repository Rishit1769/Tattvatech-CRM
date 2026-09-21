import { NextResponse } from "next/server";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireAnyPermission(["project.view", "project.view_all", "project.view_department", "project.view_assigned"]);
    const families = await prisma.projectFamily.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });
    return NextResponse.json({ families });
  } catch (error) {
    return error instanceof Error && error.message === "UNAUTHENTICATED" ? apiError("Authentication required", 401) : error instanceof Error && error.message === "FORBIDDEN" ? apiError("Forbidden", 403) : apiError("Unable to load project families", 500);
  }
}
