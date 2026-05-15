'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarRange,
  Globe,
  Loader2,
  MapPin,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { ChoirEvent } from '@/types/database';
import { CancelEventDialog } from '@/components/admin/CancelEventDialog';
import {
  EVENT_DISPLAY_STATUS_TONE,
  type EventDisplayStatus,
  deriveEventDisplayStatus,
  formatEventDate,
} from '@/components/admin/eventStatus';

const ALL = '__all__';

const DISPLAY_STATUS_OPTIONS: EventDisplayStatus[] = [
  'upcoming',
  'ongoing',
  'past',
  'cancelled',
  'draft',
];

export default function AdminEventsPage() {
  const locale = useLocale();
  const t = useTranslations('adminEvents.list');
  const displayStatusT = useTranslations('adminEvents.displayStatus');

  const [events, setEvents] = React.useState<ChoirEvent[]>([]);
  const [applicantCounts, setApplicantCounts] = React.useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    (async () => {
      const eventsResult = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (cancelled) return;

      if (eventsResult.error) {
        console.error('Failed to load events', eventsResult.error);
        setLoadError(eventsResult.error.message);
        setEvents([]);
        setLoading(false);
        return;
      }

      const list = (eventsResult.data ?? []) as ChoirEvent[];
      setEvents(list);
      setLoadError(null);

      // Load applicant counts in parallel.
      const counts = await Promise.all(
        list.map(async (event) => {
          const { count } = await supabase
            .from('event_applications')
            .select('id', { head: true, count: 'exact' })
            .eq('event_id', event.id);
          return [event.id, count ?? 0] as const;
        })
      );

      if (cancelled) return;
      setApplicantCounts(Object.fromEntries(counts));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const now = React.useMemo(() => Date.now(), [events]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((event) => {
      const display = deriveEventDisplayStatus(
        event.status,
        event.date,
        event.time,
        now
      );
      if (statusFilter !== ALL && display !== statusFilter) return false;
      if (term) {
        const haystack = `${event.title} ${event.venue}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [events, search, statusFilter, now]);

  const hasFilters = search.trim() !== '' || statusFilter !== ALL;

  const handleCancelled = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
            {t('subtitle')}
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" aria-hidden />
            {t('createCta')}
          </Link>
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="events-search" className="sr-only">
                {t('search.label')}
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="events-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="events-status-filter">
                {t('filters.status')}
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="events-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t('filters.allStatuses')}</SelectItem>
                  {DISPLAY_STATUS_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {displayStatusT(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter(ALL);
                }}
                className="gap-1.5 text-muted-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
                {filtered.length === 0 ? '' : null}
                Reset
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState />
          ) : loadError ? (
            <ErrorState message={loadError} />
          ) : filtered.length === 0 ? (
            <EmptyState message={t('empty')} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.title')}</TableHead>
                    <TableHead className="w-44">{t('table.date')}</TableHead>
                    <TableHead>{t('table.venue')}</TableHead>
                    <TableHead className="w-32">{t('table.status')}</TableHead>
                    <TableHead className="w-28">
                      {t('table.applicants')}
                    </TableHead>
                    <TableHead className="w-48 text-right">
                      {t('table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((event) => {
                    const display = deriveEventDisplayStatus(
                      event.status,
                      event.date,
                      event.time,
                      now
                    );
                    const count = applicantCounts[event.id] ?? 0;
                    const canCancel =
                      event.status !== 'cancelled' && event.status !== 'completed';
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="text-foreground hover:text-gold-600 hover:underline underline-offset-4"
                          >
                            {event.title}
                          </Link>
                          {event.is_online ? (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" aria-hidden />
                              Online
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatEventDate(event.date, event.time, locale)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            {event.venue}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              EVENT_DISPLAY_STATUS_TONE[display]
                            )}
                          >
                            {displayStatusT(display)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" aria-hidden />
                            {count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              asChild
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              <Link href={`/admin/events/${event.id}`}>
                                {t('actions.edit')}
                              </Link>
                            </Button>
                            <CancelEventDialog
                              eventId={event.id}
                              disabled={!canCancel}
                              onCancelled={handleCancelled}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// State helpers
// ─────────────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>Loading…</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-rose-700">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <CalendarRange className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
