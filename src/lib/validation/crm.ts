import { z } from "zod";

export const leadCreateSchema = z.object({
  organizationName: z.string().trim().min(1).max(200),
  primaryContactName: z.string().trim().min(1).max(160),
  primaryContactRole: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  source: z.string().trim().max(80).optional(),
  interest: z.string().trim().max(120).optional(),
  expectedValue: z.coerce.number().min(0).optional(),
  ownerUserId: z.string().uuid().optional(),
  summary: z.string().max(5000).optional(),
});

export const leadPatchSchema = leadCreateSchema.partial().extend({ priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional() });
export const stageSchema = z.object({ stage: z.enum(["NEW", "CONTACTED", "MEETING_SCHEDULED", "MEETING_DONE", "PROPOSAL_REQUIRED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"]), note: z.string().max(1000).optional(), lostReason: z.string().max(1000).optional() });
export const clientCreateSchema = z.object({ name: z.string().trim().min(1).max(200), email: z.string().email().optional().or(z.literal("")), phone: z.string().max(40).optional(), industry: z.string().max(120).optional(), notes: z.string().max(5000).optional(), originatingLeadId: z.string().uuid().optional() });
export const meetingCreateSchema = z.object({ title: z.string().min(1).max(200), meetingType: z.string().min(1).max(80), leadId: z.string().uuid().optional(), clientId: z.string().uuid().optional(), scheduledStart: z.string().datetime(), scheduledEnd: z.string().datetime().optional(), mode: z.string().max(40).optional(), agenda: z.string().max(5000).optional() });
export const followUpCreateSchema = z.object({ title: z.string().min(1).max(200), description: z.string().max(5000).optional(), leadId: z.string().uuid().optional(), clientId: z.string().uuid().optional(), dueAt: z.string().datetime(), assignedUserId: z.string().uuid().optional() });
