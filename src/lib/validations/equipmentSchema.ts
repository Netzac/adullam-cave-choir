import { z } from 'zod';

export const EQUIPMENT_STATUS_VALUES = [
  'planned',
  'in_progress',
  'completed',
  'maintenance',
] as const;

export const EQUIPMENT_TYPE_VALUES = [
  'speakers',
  'microphones',
  'mixers',
  'amplifiers',
  'monitors',
  'instruments',
  'lighting',
  'cabling',
  'acoustic',
  'projectors',
  'other',
] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const equipmentRecordSchema = z.object({
  church_name: z.string().trim().min(2, 'Church name is required').max(200),
  location: z.string().trim().min(2, 'Location is required').max(200),
  service_date: z
    .string()
    .trim()
    .regex(DATE_RE, 'Pick a valid date (YYYY-MM-DD)'),
  equipment_types: z
    .array(z.string().trim().min(1).max(50))
    .min(1, 'Select at least one equipment type')
    .max(20, 'Too many equipment types'),
  notes: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.trim() ? v : null)),
  status: z.enum(EQUIPMENT_STATUS_VALUES).default('planned'),
  gallery_item_ids: z.array(z.string().uuid()).default([]),
});

export type EquipmentRecordInput = z.infer<typeof equipmentRecordSchema>;
