import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarPlus,
  CalendarRange,
  HandCoins,
  Image as ImageIcon,
  ImagePlus,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
  Upload,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/server';
import type {
  AppNotification,
  Application,
  ApplicationStatus,
  ChoirEvent,
  Database,
  NotificationType,
} from '@/types/database';
import { DashboardAnalytics } from '@/components/admin/DashboardAnalytics';

export const dynamic = 'force-dynamic';

const PENDING_STATUSES: ApplicationStatus[] = ['pending', 'reviewing'];
const CHOIR_TZ = 'Africa/Accra';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminDashboard');
  return { title: `${t('title')} — Adullam Cave Choir` };
}

export default async function AdminDashboardPage() {
  const t = await getTranslations('adminDashboard');
  const locale = await getLocale();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
          {t('subtitle')}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t('title')}
        </h1>
      </header>

      <section aria-label={t('title')}>
        <React.Suspense fallback={<StatsSkeleton />}>
          <StatsRow />
        </React.Suspense>
      </section>

      <React.Suspense fallback={<StatsSkeleton />}>
        <DashboardAnalytics />
      </React.Suspense>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-xl">{t('applications.title')}</CardTitle>
              <CardDescription>{t('applications.description')}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-gold-600">
              <Link href="/admin/applications">
                {t('viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={<TableSkeleton rows={5} cols={4} />}>
              <RecentApplications locale={locale} />
            </React.Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('quickActions.title')}</CardTitle>
            <CardDescription>{t('quickActions.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <QuickActionButton
              href="/admin/events/new"
              icon={CalendarPlus}
              label={t('quickActions.newEvent')}
            />
            <QuickActionButton
              href="/admin/applications"
              icon={UserPlus}
              label={t('quickActions.viewApplications')}
            />
            <QuickActionButton
              href="/admin/gallery/upload"
              icon={ImagePlus}
              label={t('quickActions.uploadMedia')}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-xl">{t('events.title')}</CardTitle>
              <CardDescription>{t('events.description')}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-gold-600">
              <Link href="/admin/events">
                {t('viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={<EventsSkeleton />}>
              <UpcomingEvents locale={locale} />
            </React.Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-xl">{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.description')}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-gold-600">
              <Link href="/admin/notifications">
                {t('viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={<NotificationsSkeleton />}>
              <RecentNotifications locale={locale} />
            </React.Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats row
// ─────────────────────────────────────────────────────────────────────────────

async function StatsRow() {
  const t = await getTranslations('adminDashboard.stats');
  const locale = await getLocale();
  const supabase = createClient();

  const stats = await loadStats(supabase).catch(() => null);
  if (!stats) {
    return <SectionError />;
  }

  const numberFmt = new Intl.NumberFormat(locale);
  const currencyFmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  });

  const cards: StatCardData[] = [
    {
      label: t('applications'),
      hint: t('applicationsHint'),
      value: numberFmt.format(stats.applicationsTotal),
      delta: stats.applicationsThisMonth,
      icon: Users,
      iconClass: 'bg-purple-100 text-purple-700',
    },
    {
      label: t('pending'),
      hint: t('pendingHint'),
      value: numberFmt.format(stats.applicationsPending),
      delta: null,
      icon: Mail,
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      label: t('events'),
      hint: t('eventsHint'),
      value: numberFmt.format(stats.upcomingEvents),
      delta: null,
      icon: CalendarRange,
      iconClass: 'bg-rose-100 text-rose-700',
    },
    {
      label: t('gallery'),
      hint: t('galleryHint'),
      value: numberFmt.format(stats.galleryPublished),
      delta: null,
      icon: ImageIcon,
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: t('donations'),
      hint: t('donationsHint'),
      value: currencyFmt.format(stats.donationsTotal),
      delta: stats.donationsThisMonth,
      deltaFormatter: (v) => currencyFmt.format(v),
      icon: HandCoins,
      iconClass: 'bg-gold-100 text-gold-700',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} data={card} />
      ))}
    </div>
  );
}

interface StatCardData {
  label: string;
  hint: string;
  value: string;
  delta: number | null;
  deltaFormatter?: (value: number) => string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}

function StatCard({ data }: { data: StatCardData }) {
  const Icon = data.icon;
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-lg',
              data.iconClass
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          {data.delta !== null ? (
            <TrendBadge value={data.delta} formatter={data.deltaFormatter} />
          ) : null}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {data.label}
          </p>
          <p className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            {data.value}
          </p>
          <p className="text-xs text-muted-foreground">{data.hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({
  value,
  formatter,
}: {
  value: number;
  formatter?: (value: number) => string;
}) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const display = formatter
    ? formatter(Math.abs(value))
    : new Intl.NumberFormat().format(Math.abs(value));
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        direction === 'up' && 'bg-emerald-50 text-emerald-700',
        direction === 'down' && 'bg-rose-50 text-rose-700',
        direction === 'flat' && 'bg-muted text-muted-foreground'
      )}
    >
      <ArrowUpRight
        className={cn(
          'h-3 w-3',
          direction === 'down' && 'rotate-90',
          direction === 'flat' && 'opacity-50'
        )}
      />
      {direction === 'up' ? '+' : direction === 'down' ? '−' : ''}
      {display}
    </span>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent applications
// ─────────────────────────────────────────────────────────────────────────────

async function RecentApplications({ locale }: { locale: string }) {
  const t = await getTranslations('adminDashboard.applications');
  const statusT = await getTranslations('adminDashboard.applicationStatus');
  const supabase = createClient();

  const result = await supabase
    .from('applications')
    .select('id, full_name, preferred_program, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (result.error) {
    return <SectionError />;
  }

  const rows = (result.data ?? []) as Pick<
    Application,
    'id' | 'full_name' | 'preferred_program' | 'status' | 'created_at'
  >[];

  if (rows.length === 0) {
    return <EmptyState message={t('empty')} icon={Users} />;
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: CHOIR_TZ,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('name')}</TableHead>
          <TableHead>{t('program')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead className="text-right">{t('date')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.full_name}</TableCell>
            <TableCell className="text-muted-foreground">
              {row.preferred_program}
            </TableCell>
            <TableCell>
              <ApplicationStatusBadge
                status={row.status}
                label={statusT(row.status)}
              />
            </TableCell>
            <TableCell className="text-right text-sm text-muted-foreground">
              {dateFmt.format(new Date(row.created_at))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ApplicationStatusBadge({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  const tone: Record<ApplicationStatus, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    reviewing: 'bg-sky-50 text-sky-800 border-sky-200',
    shortlisted: 'bg-violet-50 text-violet-800 border-violet-200',
    accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
    waitlisted: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <Badge variant="outline" className={cn('border', tone[status])}>
      {label}
    </Badge>
  );
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upcoming events
// ─────────────────────────────────────────────────────────────────────────────

async function UpcomingEvents({ locale }: { locale: string }) {
  const t = await getTranslations('adminDashboard.events');
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const result = await supabase
    .from('events')
    .select('id, title, date, time, venue, capacity')
    .gte('date', today)
    .in('status', ['scheduled', 'live'])
    .order('date', { ascending: true })
    .limit(3);

  if (result.error) {
    return <SectionError />;
  }

  const events = (result.data ?? []) as Pick<
    ChoirEvent,
    'id' | 'title' | 'date' | 'time' | 'venue' | 'capacity'
  >[];

  if (events.length === 0) {
    return <EmptyState message={t('empty')} icon={CalendarRange} />;
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: CHOIR_TZ,
  });

  return (
    <ul className="divide-y divide-border">
      {events.map((event) => {
        const when = parseEventDateTime(event.date, event.time);
        return (
          <li key={event.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-purple-50 text-purple-800">
              <span className="text-[10px] font-semibold uppercase">
                {dateFmt.formatToParts(when).find((p) => p.type === 'month')?.value}
              </span>
              <span className="-mt-0.5 font-serif text-lg font-bold leading-none">
                {dateFmt.formatToParts(when).find((p) => p.type === 'day')?.value}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{event.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {dateFmt.format(when)}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.venue}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {t('capacity', { count: event.capacity ?? 0 })}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function parseEventDateTime(date: string, time: string): Date {
  // events.date is YYYY-MM-DD; time is HH:MM[:SS]. Interpret as Africa/Accra
  // (UTC+0, no DST), so an ISO Z suffix produces the right instant.
  const safeTime = time?.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${safeTime}Z`);
}

function EventsSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick actions
// ─────────────────────────────────────────────────────────────────────────────

function QuickActionButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto w-full justify-start gap-3 border-border/70 bg-background py-3 text-left hover:border-gold-400 hover:bg-gold-50/40"
    >
      <Link href={href}>
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold-100 text-gold-700"
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent notifications
// ─────────────────────────────────────────────────────────────────────────────

async function RecentNotifications({ locale }: { locale: string }) {
  const t = await getTranslations('adminDashboard.notifications');
  const rt = await getTranslations('adminDashboard.relativeTime');
  const supabase = createClient();

  const result = await supabase
    .from('notifications')
    .select('id, title, message, type, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (result.error) {
    return <SectionError />;
  }

  const items = (result.data ?? []) as Pick<
    AppNotification,
    'id' | 'title' | 'message' | 'type' | 'is_read' | 'created_at'
  >[];

  if (items.length === 0) {
    return <EmptyState message={t('empty')} icon={Bell} />;
  }

  const now = Date.now();

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = notificationIcon(item.type);
        return (
          <li
            key={item.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border border-border/60 p-3',
              !item.is_read && 'bg-gold-50/40'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                notificationTone(item.type)
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {item.message}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">
                {formatRelativeTime(now, item.created_at, rt, locale)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function notificationIcon(
  type: NotificationType
): React.ComponentType<{ className?: string }> {
  switch (type) {
    case 'application':
      return UserPlus;
    case 'event_application':
      return CalendarRange;
    case 'donation':
      return Wallet;
    case 'contact':
      return MessageSquare;
    case 'system':
    default:
      return Sparkles;
  }
}

function notificationTone(type: NotificationType): string {
  switch (type) {
    case 'application':
      return 'bg-purple-100 text-purple-700';
    case 'event_application':
      return 'bg-rose-100 text-rose-700';
    case 'donation':
      return 'bg-gold-100 text-gold-700';
    case 'contact':
      return 'bg-sky-100 text-sky-700';
    case 'system':
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function formatRelativeTime(
  nowMs: number,
  iso: string,
  t: (key: string, values?: Record<string, number>) => string,
  _locale: string
): string {
  void _locale;
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

function NotificationsSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared empty / error states
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({
  message,
  icon: Icon,
}: {
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 px-4 py-10 text-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

async function SectionError() {
  const t = await getTranslations('adminDashboard.errors');
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-800">
      {t('load')}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data loaders
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardStats {
  applicationsTotal: number;
  applicationsPending: number;
  applicationsThisMonth: number;
  upcomingEvents: number;
  galleryPublished: number;
  donationsTotal: number;
  donationsThisMonth: number;
}

async function loadStats(
  supabase: SupabaseClient<Database>
): Promise<DashboardStats> {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const monthStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  ).toISOString();

  const [
    applicationsTotal,
    applicationsPending,
    applicationsThisMonth,
    upcomingEvents,
    galleryPublished,
    donationsSuccess,
    donationsThisMonth,
  ] = await Promise.all([
    countRows(supabase, 'applications'),
    supabase
      .from('applications')
      .select('id', { head: true, count: 'exact' })
      .in('status', PENDING_STATUSES)
      .then((r) => (r.error ? Promise.reject(r.error) : r.count ?? 0)),
    supabase
      .from('applications')
      .select('id', { head: true, count: 'exact' })
      .gte('created_at', monthStart)
      .then((r) => (r.error ? Promise.reject(r.error) : r.count ?? 0)),
    supabase
      .from('events')
      .select('id', { head: true, count: 'exact' })
      .gte('date', todayIso)
      .in('status', ['scheduled', 'live'])
      .then((r) => (r.error ? Promise.reject(r.error) : r.count ?? 0)),
    supabase
      .from('gallery_items')
      .select('id', { head: true, count: 'exact' })
      .eq('is_published', true)
      .then((r) => (r.error ? Promise.reject(r.error) : r.count ?? 0)),
    sumDonations(supabase),
    sumDonations(supabase, monthStart),
  ]);

  return {
    applicationsTotal,
    applicationsPending,
    applicationsThisMonth,
    upcomingEvents,
    galleryPublished,
    donationsTotal: donationsSuccess,
    donationsThisMonth,
  };
}

async function countRows(
  supabase: SupabaseClient<Database>,
  table: 'applications'
): Promise<number> {
  const { error, count } = await supabase
    .from(table)
    .select('id', { head: true, count: 'exact' });
  if (error) throw error;
  return count ?? 0;
}

async function sumDonations(
  supabase: SupabaseClient<Database>,
  since?: string
): Promise<number> {
  let query = supabase
    .from('donations')
    .select('amount')
    .eq('status', 'success');
  if (since) query = query.gte('created_at', since);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).reduce(
    (acc, row) => acc + Number((row as { amount: number }).amount ?? 0),
    0
  );
}
