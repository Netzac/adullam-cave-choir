import type { DonationStatus } from '@/types/database';

/** DB statuses exposed in admin filters and badges. */
export const DONATION_STATUS_VALUES: DonationStatus[] = [
  'initiated',
  'success',
  'failed',
  'refunded',
];

export const DONATION_STATUS_TONE: Record<DonationStatus, string> = {
  initiated: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  failed: 'border-rose-200 bg-rose-50 text-rose-800',
  refunded: 'border-slate-200 bg-slate-100 text-slate-700',
};

/** Maps DB `donation_status` to `adminDonations.status` translation keys. */
export const DONATION_STATUS_LABEL_KEY: Record<
  DonationStatus,
  'pending' | 'completed' | 'failed' | 'refunded'
> = {
  initiated: 'pending',
  success: 'completed',
  failed: 'failed',
  refunded: 'refunded',
};
