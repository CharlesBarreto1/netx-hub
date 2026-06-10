import { z } from 'zod';

export const CreateLicenseeSchema = z.object({
  name: z.string().min(1).max(200),
  taxId: z.string().max(40).optional(),
  contactEmail: z.string().email().optional(),
  plan: z.string().max(40).default('per-contract'),
  maxContracts: z.number().int().min(0).default(0),
  pricePerContractCents: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
});
export type CreateLicensee = z.infer<typeof CreateLicenseeSchema>;

export const CreateInstanceSchema = z.object({
  licenseeId: z.string().uuid(),
  /** instanceId gerado no enrollment do installer (NETX_INSTANCE_ID). */
  instanceId: z.string().uuid(),
  label: z.string().max(120).optional(),
  blockMode: z.enum(['UI_ONLY', 'UI_AND_PROVISIONING']).default('UI_ONLY'),
});
export type CreateInstance = z.infer<typeof CreateInstanceSchema>;

export const SetStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED', 'SUSPENDED']),
});
export type SetStatus = z.infer<typeof SetStatusSchema>;
