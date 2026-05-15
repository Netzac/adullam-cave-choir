'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, CalendarRange, Loader2, MapPin, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type {
  ChoirEvent,
  EventApplication,
  EventApplicationStatus,
} from '@/types/database';
import { EventForm } from '@/components/admin/EventForm';
import { CancelEventDialog } from '@/components/admin/CancelEventDialog';
import {
  EVENT_DISPLAY_STATUS_TONE,
  deriveEventDisplayStatus,
  formatEventDate,
} from '@/components/admin/eventStatus';

const APPLICANT_STATUS_TONE: Record<EventApplicationStatus, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  attended: 'bg-sky-50 text-sky-800 border-sky-200',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  declined: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const locale = useLocale();
  const t = useTranslations('adminEvents.detail');
  const displayStatusT = useTranslations('adminEvents.displayStatus');
  const applicantStatusT = useTranslations(
    'adminEvents.detail.applicantStatus'
  );

  const [event, setEvent] = React.useState<ChoirEvent | null>(null);
  const [applicants, setApplicants] = React.useState<EventApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    (async () => {
      const [eventResult, applicantsResult] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).maybeSingle(),
        supabase
          .from('event_applications')
          .select('*')
          .eq('event_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (cancelled) return;

      if (eventResult.error) {
        console.error('Failed to load event', eventResult.error);
        setLoadError(eventResult.error.message);
      } else {
        setEvent((eventResult.data as ChoirEvent | null) ?? null);
        setLoadError(null);
      }

      if (applicantsResult.error) {
        console.error('Failed to load applicants', applicantsResult.error);
        setApplicants([]);
      } else {
        setApplicants((applicantsResult.data ?? []) as EventApplication[]);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayStatus = React.useMemo(() => {
    if (!event) return null;
    return deriveEventDisplayStatus(event.status, event.date, event.time);
  }, [event]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Loading…</span>
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="space-y-6">
        <Button
          asChild
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1.5 text-muted-foreground"
        >
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('back')}
          </Link>
        </Button>
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-rose-700">
            {loadError ? t('loadError') : t('notFound')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const dateFmt = new Intl.NumberFormat(locale);
  const canCancel =
    event.status !== 'cancelled' && event.status !== 'completed';

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Button
          asChild
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1.5 text-muted-foreground"
        >
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('back')}
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
              {t('title')}
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4" aria-hidden />
                {formatEventDate(event.date, event.time, locale, {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden />
                {event.venue}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden />
                {dateFmt.format(applicants.length)}
              </span>
              {displayStatus ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                    EVENT_DISPLAY_STATUS_TONE[displayStatus]
                  )}
                >
                  {displayStatusT(displayStatus)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CancelEventDialog eventId={event.id} disabled={!canCancel} />
          </div>
        </div>
      </header>

      <Card>
        <CardContent className="p-5 sm:p-8">
          <EventForm mode="edit" event={event} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">
            {t('applicants.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('applicants.subtitle')}
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            {applicants.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <Users className="h-5 w-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  {t('applicants.empty')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('applicants.name')}</TableHead>
                      <TableHead>{t('applicants.organization')}</TableHead>
                      <TableHead>{t('applicants.email')}</TableHead>
                      <TableHead>{t('applicants.phone')}</TableHead>
                      <TableHead className="w-32">
                        {t('applicants.status')}
                      </TableHead>
                      <TableHead className="w-36">
                        {t('applicants.submitted')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium text-foreground">
                          {applicant.full_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {applicant.organization ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <a
                            href={`mailto:${applicant.email}`}
                            className="text-foreground hover:text-gold-600 hover:underline underline-offset-4"
                          >
                            {applicant.email}
                          </a>
                        </TableCell>
                        <TableCell className="text-sm">
                          <a
                            href={`tel:${applicant.phone}`}
                            className="text-foreground hover:text-gold-600 hover:underline underline-offset-4"
                          >
                            {applicant.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              APPLICANT_STATUS_TONE[applicant.status]
                            )}
                          >
                            {applicantStatusT(applicant.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                            timeZone: 'Africa/Accra',
                          }).format(new Date(applicant.created_at))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
