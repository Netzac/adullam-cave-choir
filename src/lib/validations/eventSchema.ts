import { z } from 'zod';

export const EVENT_STATUS_VALUES = [
  'draft',
  'scheduled',
  'live',
  'completed',
  'cancelled',
] as const;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const eventSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(160),
  description: z.string().trim().min(10, 'Add a short description').max(4000),
  audience: z.string().trim().min(2, 'Who is this for?').max(160),
  date: z
    .string()
    .trim()
    .regex(DATE_RE, 'Pick a valid date (YYYY-MM-DD)'),
  time: z
    .string()
    .trim()
    .regex(TIME_RE, 'Pick a valid time (HH:MM)'),
  venue: z.string().trim().min(2, 'Venue is required').max(200),
  capacity: z
    .union([z.string(), z.number()])
    .transform((value) => {
      if (value === '' || value === null || value === undefined) return null;
      const n =
        typeof value === 'number' ? value : Number.parseInt(value as string, 10);
      return Number.isFinite(n) ? n : null;
    })
    .pipe(
      z
        .number()
        .int('Capacity must be a whole number')
        .positive('Capacity must be greater than zero')
        .max(100000, 'Capacity is too large')
        .nullable()
    ),
  fee: z
    .union([z.string(), z.number()])
    .transform((value) => {
      if (value === '' || value === null || value === undefined) return 0;
      const n = typeof value === 'number' ? value : Number.parseFloat(value as string);
      return Number.isFinite(n) ? n : Number.NaN;
    })
    .pipe(
      z
        .number({ message: 'Fee must be a number' })
        .min(0, 'Fee cannot be negative')
        .max(1_000_000, 'Fee is too large')
    ),
  currency: z.string().trim().min(3).max(8).default('GHS'),
  is_online: z.boolean().default(false),
  status: z.enum(EVENT_STATUS_VALUES).default('draft'),
});

export type EventInput = z.infer<typeof eventSchema>;
