/**
 * Relative time labels for admin notifications (e.g. "5 minutes ago").
 */
export function formatRelativeTime(
  nowMs: number,
  iso: string,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const diffMs = nowMs - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60_000));
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutes', { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('hours', { count: hours });
  const days = Math.round(hours / 24);
  if (days < 7) return t('days', { count: days });
  const weeks = Math.round(days / 7);
  return t('weeks', { count: weeks });
}
