import { db } from "@/lib/db/pool";

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
  await db.execute(
    `INSERT INTO audit_logs
      (id, actor_user_id, action, entity_type, entity_id, before_json, after_json, request_id, created_at)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
    [
      input.actorUserId ?? null,
      input.action,
      input.entityType,
      input.entityId,
      input.before == null ? null : JSON.stringify(input.before),
      input.after == null ? null : JSON.stringify(input.after),
      input.requestId ?? null,
    ],
  );
}
