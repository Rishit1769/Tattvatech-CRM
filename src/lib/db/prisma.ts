import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/config/env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  datasourceUrl: process.env.DATABASE_URL ?? `mysql://${encodeURIComponent(env.DATABASE_USER)}:${encodeURIComponent(env.DATABASE_PASSWORD)}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`,
});

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
