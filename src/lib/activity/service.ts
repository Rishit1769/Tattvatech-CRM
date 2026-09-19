import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

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
  await prisma.activity.create({ data: { activityType: input.activityType, actorUserId: input.actorUserId ?? null, entityType: input.entityType, entityId: input.entityId, parentEntityType: input.parentEntityType ?? null, parentEntityId: input.parentEntityId ?? null, summary: input.summary, metadata: (input.metadata ?? {}) as Prisma.InputJsonValue } });
}
