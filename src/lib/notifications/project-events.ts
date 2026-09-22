import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/mail/service";
import { env } from "@/lib/config/env";

type ProjectEvent = { projectId: string; projectName: string; projectCode: string; clientName: string; targetUrl: string; actorName: string; recipients: { id: string; fullName: string; email: string }[]; eventType: "PROJECT_CREATED" | "PROJECT_ASSIGNED"; role?: string; skipNotification?: boolean };

function projectEmail(event: ProjectEvent, recipient: string) {
  const assignment = event.eventType === "PROJECT_ASSIGNED";
  const subject = assignment ? `Project assigned: ${event.projectName}` : `New project requires technical review: ${event.projectName}`;
  const intro = assignment ? `You have been assigned to ${event.projectName} as ${event.role ?? "a project member"}.` : `A new TattvaTech project has been created and is ready for technical planning.`;
  return { subject, html: `<p>${intro}</p><p><strong>Project:</strong> ${event.projectName}<br><strong>Client:</strong> ${event.clientName}<br><strong>Stage:</strong> Planning<br><strong>Created or assigned by:</strong> ${event.actorName}</p><p><a href="${event.targetUrl.startsWith("http") ? event.targetUrl : `${env.APP_URL}${event.targetUrl}`}">View project</a></p>`, recipient };
}

export async function notifyProjectEvent(event: ProjectEvent) {
  if (!event.skipNotification) await prisma.notification.createMany({ data: event.recipients.map((recipient) => ({ userId: recipient.id, type: event.eventType, title: event.eventType === "PROJECT_ASSIGNED" ? "Project assigned" : "New project", body: event.eventType === "PROJECT_ASSIGNED" ? `${event.projectName} was assigned to you as ${event.role ?? "project member"}.` : `${event.projectName} was created by ${event.actorName} and is ready for technical planning.`, targetUrl: event.targetUrl })) });
  await Promise.allSettled(event.recipients.map(async (recipient) => { const mail = projectEmail(event, recipient.email); return sendEmail({ eventType: event.eventType.toLowerCase(), recipientEmail: mail.recipient, recipientName: recipient.fullName, subject: mail.subject, html: mail.html, entityType: "project", entityId: event.projectId }); }));
}

export async function findCtoRecipients() {
  return prisma.user.findMany({ where: { status: "ACTIVE", OR: [{ role: { name: "CTO" } }, { userRoles: { some: { role: { name: "CTO" } } } }] }, select: { id: true, fullName: true, email: true } });
}
