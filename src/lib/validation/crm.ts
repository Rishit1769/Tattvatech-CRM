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
export const projectCreateSchema = z.object({ name: z.string().trim().min(1).max(200), familyId: z.string().uuid().optional(), clientId: z.string().uuid().optional(), originatingLeadId: z.string().uuid().optional(), projectType: z.enum(["INTERNAL_PRODUCT", "CLIENT_PROJECT", "INTERNAL_TOOL", "R_AND_D"]).default("CLIENT_PROJECT"), departmentId: z.string().uuid().optional(), projectOwnerUserId: z.string().uuid().optional(), managerUserId: z.string().uuid().optional(), technicalOwnerUserId: z.string().uuid().optional(), type: z.string().max(100).optional(), description: z.string().max(10000).optional(), dealValue: z.coerce.number().min(0).optional(), startDate: z.string().optional(), expectedDeliveryDate: z.string().optional(), paymentStructureNotes: z.string().max(5000).optional(), repositoryUrl: z.string().url().max(500).optional().or(z.literal("")), priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional() });
export const taskCreateSchema = z.object({ projectId: z.string().uuid(), moduleId: z.string().uuid().optional(), title: z.string().min(1).max(200), description: z.string().max(5000).optional(), assignedUserId: z.string().uuid().optional(), priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(), startDate: z.string().optional(), dueAt: z.string().datetime().optional(), targetRelease: z.string().max(80).optional() });
export const taskPatchSchema = z.object({ status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE", "CANCELLED"]).optional(), priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(), completionNote: z.string().max(5000).optional() });
export const milestoneCreateSchema = z.object({ projectId: z.string().uuid(), title: z.string().min(1).max(200), description: z.string().max(5000).optional(), dueDate: z.string().optional(), paymentAmount: z.coerce.number().min(0).optional(), paymentPercentage: z.coerce.number().min(0).max(100).optional(), invoiceRequired: z.boolean().optional() });
export const transactionCreateSchema = z.object({ type: z.enum(["PAYMENT_RECEIVED", "EXPENSE", "REFUND", "TRANSFER", "OTHER_INCOME", "OTHER"]), clientId: z.string().uuid().optional(), projectId: z.string().uuid().optional(), amcId: z.string().uuid().optional(), amount: z.coerce.number().positive(), currency: z.string().length(3).default("INR"), paymentMethod: z.string().max(60).optional(), transactionDate: z.string(), referenceNumber: z.string().max(120).optional(), description: z.string().max(5000).optional(), generateInvoice: z.boolean().optional() });
export const voidTransactionSchema = z.object({ reason: z.string().min(1).max(1000) });
export const amcCreateSchema = z.object({ clientId: z.string().uuid(), projectId: z.string().uuid().optional(), title: z.string().min(1).max(200), description: z.string().max(5000).optional(), billingFrequency: z.string().max(30), amount: z.coerce.number().positive(), currency: z.string().length(3).default("INR"), startDate: z.string(), nextDueDate: z.string(), endDate: z.string().optional(), responsibleUserId: z.string().uuid().optional(), notes: z.string().max(5000).optional() });
