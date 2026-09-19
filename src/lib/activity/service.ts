import { db } from "@/lib/db/pool";

export type ActivityInput = {
  activityType: string;
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  parentEntityType?: string | null;
  parentEntityId?: string | null;
};

export async function recordActivity(input: ActivityInput): Promise<void> {
  await db.execute(
    `INSERT INTO activities
      (id, activity_type, actor_user_id, entity_type, entity_id, parent_entity_type,
       parent_entity_id, summary, metadata_json, created_at)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
    [
      input.activityType,
      input.actorUserId ?? null,
      input.entityType,
      input.entityId,
      input.parentEntityType ?? null,
      input.parentEntityId ?? null,
      input.summary,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}
