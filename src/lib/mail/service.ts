import nodemailer from "nodemailer";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import type { EmailStatus } from "@prisma/client";

type SendEmailInput = { eventType: string; recipientEmail: string; recipientName?: string; subject: string; html: string; entityType?: string; entityId?: string; initiatedByUserId?: string };

function transporter() {
  if (!env.SMTP_HOST) return null;
  return nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465, auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined });
}

export async function sendEmail(input: SendEmailInput) {
  const event = await prisma.emailEvent.create({ data: { eventType: input.eventType, recipientEmail: input.recipientEmail, recipientName: input.recipientName, subject: input.subject, entityType: input.entityType, entityId: input.entityId, initiatedByUserId: input.initiatedByUserId, attemptedAt: new Date() } });
  const mailer = transporter();
  if (!mailer) { await prisma.emailEvent.update({ where: { id: event.id }, data: { status: "SKIPPED" as EmailStatus, failureMessage: "SMTP is not configured" } }); return { status: "SKIPPED" as const, eventId: event.id }; }
  try { await mailer.sendMail({ from: env.SMTP_FROM, to: input.recipientEmail, subject: input.subject, html: input.html }); await prisma.emailEvent.update({ where: { id: event.id }, data: { status: "SENT", sentAt: new Date() } }); return { status: "SENT" as const, eventId: event.id }; } catch (error) { const message = error instanceof Error ? error.message : "SMTP delivery failed"; await prisma.emailEvent.update({ where: { id: event.id }, data: { status: "FAILED", failureMessage: message } }); return { status: "FAILED" as const, eventId: event.id, error: message }; }
}

export async function resendEmail(eventId: string) {
  const event = await prisma.emailEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("EMAIL_NOT_FOUND");
  return sendEmail({ eventType: `${event.eventType}.resend`, recipientEmail: event.recipientEmail, recipientName: event.recipientName ?? undefined, subject: event.subject, html: `<p>${event.subject}</p>`, entityType: event.entityType ?? undefined, entityId: event.entityId ?? undefined, initiatedByUserId: event.initiatedByUserId ?? undefined });
}
