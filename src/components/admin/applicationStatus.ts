import type { ApplicationStatus } from '@/types/database';

const CHOIR_TZ = 'Africa/Accra';

/**
 * Tailwind class strings for each application status badge.
 * Color intent maps to the prompt's editorial status names:
 *   pending     → Received    (blue)
 *   reviewing   → Under Review (yellow)
 *   shortlisted → Shortlisted (violet, kept for display only)
 *   accepted    → Admitted    (green)
 *   rejected    → Rejected    (red)
 *   waitlisted  → Waitlisted  (purple)
 */
export const APPLICATION_STATUS_TONE: Record<ApplicationStatus, string> = {
  pending: 'bg-sky-50 text-sky-800 border-sky-200',
  reviewing: 'bg-amber-50 text-amber-800 border-amber-200',
  shortlisted: 'bg-violet-50 text-violet-800 border-violet-200',
  accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  waitlisted: 'bg-purple-50 text-purple-800 border-purple-200',
};

/**
 * Status keys exposed in the admin status dropdown. Per the prompt: Received,
 * Under Review, Admitted, Rejected, Waitlisted (5 entries). `shortlisted`
 * remains a valid DB value and renders correctly when set externally.
 */
export const EDITABLE_APPLICATION_STATUSES: ApplicationStatus[] = [
  'pending',
  'reviewing',
  'accepted',
  'rejected',
  'waitlisted',
];

/**
 * Maps every DB status to its i18n key under `adminApplications.status`.
 */
export const APPLICATION_STATUS_LABEL_KEY: Record<ApplicationStatus, string> = {
  pending: 'received',
  reviewing: 'underReview',
  shortlisted: 'shortlisted',
  accepted: 'admitted',
  rejected: 'rejected',
  waitlisted: 'waitlisted',
};

export function formatApplicationDate(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: CHOIR_TZ,
    ...options,
  }).format(new Date(iso));
}
