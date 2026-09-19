import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_HOST: z.string().default("127.0.0.1"),
  DATABASE_PORT: z.coerce.number().int().positive().default(3306),
  DATABASE_NAME: z.string().min(1).default("tattvatech_crm"),
  DATABASE_USER: z.string().min(1).default("tattvatech"),
  DATABASE_PASSWORD: z.string().default(""),
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  SESSION_COOKIE_NAME: z.string().min(1).default("tt_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
  SESSION_SECRET: z.string().min(16).default("development-only-change-me"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("TattvaTech CRM <crm@example.com>"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_CONNECTION_LIMIT: process.env.DATABASE_CONNECTION_LIMIT,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
});
