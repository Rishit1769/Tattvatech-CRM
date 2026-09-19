import { prisma } from "@/lib/db/prisma";

export type AuditInput = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  requestId?: string | null;
};

export async function recordAudit(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({ data: { actorUserId: input.actorUserId ?? null, action: input.action, entityType: input.entityType, entityId: input.entityId, before: input.before ?? undefined, after: input.after ?? undefined, requestId: input.requestId ?? null } });
}
