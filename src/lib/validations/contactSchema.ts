import { z } from 'zod';

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Please enter a subject').max(160),
  message: z.string().trim().min(10, 'Message is too short').max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
