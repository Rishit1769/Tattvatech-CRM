import { z } from "zod";

export const demoCreateSchema = z.object({ templateKey: z.enum(["school-erp", "college-erp", "custom"]), leadId: z.string().uuid().optional(), clientId: z.string().uuid().optional(), meetingId: z.string().uuid().optional(), serverId: z.string().uuid().optional(), expiryHours: z.coerce.number().min(1).max(24).default(6), sampleProfile: z.string().max(100).default("synthetic-default") });
