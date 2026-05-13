import { z } from 'zod';

export const eventApplicationSchema = z.object({
  event_id: z.string().uuid('Invalid event'),
  full_name: z.string().trim().min(2, 'Please enter your full name').max(120),
  organization: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().min(7, 'Please enter a valid phone number').max(32),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type EventApplicationInput = z.infer<typeof eventApplicationSchema>;
