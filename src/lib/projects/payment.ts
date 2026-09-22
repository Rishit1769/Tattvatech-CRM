import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/activity/service";
import { recordAudit } from "@/lib/audit/service";

export async function syncProjectPaymentStatus({ projectId, transactionId, actorUserId }: { projectId: string; transactionId: string; actorUserId: string }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  const received = await prisma.transaction.aggregate({ where: { projectId, type: "PAYMENT_RECEIVED", status: { not: "VOID" } }, _sum: { amount: true } });
  const collected = Number(received._sum.amount ?? 0);
  const target = Number(project.expectedPaymentAmount ?? project.dealValue ?? 0);
  const nextStatus = target > 0 && collected >= target ? "PAID" : collected > 0 ? "PARTIALLY_PAID" : "PENDING";
  if (project.paymentStatus === nextStatus) return project;
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.project.update({ where: { id: projectId }, data: { paymentStatus: nextStatus } });
    await tx.projectPaymentHistory.create({ data: { projectId, previousStatus: project.paymentStatus, newStatus: nextStatus, transactionId, changedById: actorUserId, note: `Payment total recorded: ${collected}.` } });
    return next;
  });
  await recordActivity({ activityType: "project.payment_status_changed", actorUserId, entityType: "project", entityId: projectId, summary: `Project ${project.projectCode} payment status changed to ${nextStatus}.`, metadata: { previousStatus: project.paymentStatus, newStatus: nextStatus, transactionId } });
  await recordAudit({ actorUserId, action: "project.payment_status.change", entityType: "project", entityId: projectId, before: { paymentStatus: project.paymentStatus }, after: { paymentStatus: nextStatus, transactionId } });
  return updated;
}
