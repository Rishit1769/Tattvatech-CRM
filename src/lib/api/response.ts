import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unknownApiError() {
  return apiError("Unable to complete the request", 500);
}
