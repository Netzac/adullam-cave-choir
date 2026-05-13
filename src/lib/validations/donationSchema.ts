import { z } from 'zod';

export const donationSchema = z.object({
  donor_name: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  amount: z.coerce
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .max(10_000_000, 'Amount looks too high'),
  currency: z.string().trim().min(3).max(8).default('GHS'),
  message: z.string().trim().max(500).optional().or(z.literal('')),
});

export type DonationInput = z.infer<typeof donationSchema>;
