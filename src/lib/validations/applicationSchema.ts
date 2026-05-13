import { z } from 'zod';

export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name').max(120),
  age: z.coerce
    .number({ message: 'Age is required' })
    .int('Age must be a whole number')
    .min(5, 'Minimum age is 5')
    .max(120, 'Please enter a valid age'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number')
    .max(32),
  email: z.string().trim().email('Please enter a valid email').optional().or(z.literal('')),
  interest_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  experience: z.string().trim().max(2000).optional().or(z.literal('')),
  preferred_program: z.string().trim().min(2, 'Please choose a program').max(120),
  guardian_consent: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  passport_photo_url: z.string().url().optional().or(z.literal('')),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
