import type { EventStatus } from '@/types/database';

const CHOIR_TZ = 'Africa/Accra';

/**
 * Human-friendly "display status" derived from DB status + date/time.
 * The DB stores: draft | scheduled | live | completed | cancelled.
 * The admin list shows: Upcoming | Ongoing | Cancelled | Past | Draft.
 */
export type EventDisplayStatus =
  | 'upcoming'
  | 'ongoing'
  | 'cancelled'
  | 'past'
  | 'draft';

export const EVENT_DISPLAY_STATUS_TONE: Record<EventDisplayStatus, string> = {
  upcoming: 'bg-sky-50 text-sky-800 border-sky-200',
  ongoing: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  past: 'bg-slate-100 text-slate-700 border-slate-200',
  draft: 'bg-amber-50 text-amber-800 border-amber-200',
};

/**
 * Approximate event duration when no end time is stored. Used solely for the
 * "Ongoing" window in the admin list.
 */
const DEFAULT_EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

/**
 * Parse a YYYY-MM-DD date + HH:MM[:SS] time as Africa/Accra (UTC+0, no DST).
 */
export function parseEventStartUtc(date: string, time: string): Date {
  const safeTime = time?.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${safeTime}Z`);
}

export function deriveEventDisplayStatus(
  dbStatus: EventStatus,
  date: string,
  time: string,
  now: number = Date.now()
): EventDisplayStatus {
  if (dbStatus === 'cancelled') return 'cancelled';
  if (dbStatus === 'draft') return 'draft';
  if (dbStatus === 'completed') return 'past';
  if (dbStatus === 'live') return 'ongoing';

  // scheduled: derive from date/time relative to now.
  const start = parseEventStartUtc(date, time).getTime();
  if (Number.isNaN(start)) return 'upcoming';
  const end = start + DEFAULT_EVENT_DURATION_MS;
  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'past';
}

export function formatEventDate(
  date: string,
  time: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: CHOIR_TZ,
    ...options,
  }).format(parseEventStartUtc(date, time));
}
