'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Clock,
  Download,
  HandCoins,
  Loader2,
  Search,
  Wallet,
  X,
} from 'lucide-react';
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
import type { Donation, DonationStatus } from '@/types/database';
import {
  DONATION_STATUS_LABEL_KEY,
  DONATION_STATUS_TONE,
  DONATION_STATUS_VALUES,
} from '@/components/admin/donationStatus';

const ALL = '__all__';

export default function AdminDonationsPage() {
  const locale = useLocale();
  const t = useTranslations('adminDonations');
  const summaryT = useTranslations('adminDonations.summary');
  const filtersT = useTranslations('adminDonations.filters');
  const statusT = useTranslations('adminDonations.status');
  const tableT = useTranslations('adminDonations.table');
  const exportT = useTranslations('adminDonations.export');
  const resultsT = useTranslations('adminDonations.results');
  const errorsT = useTranslations('adminDonations.errors');

  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load donations', error);
          setLoadError(errorsT('load'));
          setDonations([]);
        } else {
          setDonations((data ?? []) as Donation[]);
          setLoadError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [errorsT]);

  const currencyFmt = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Accra',
      }),
    [locale]
  );

  const statusLabel = React.useCallback(
    (status: DonationStatus) =>
      statusT(DONATION_STATUS_LABEL_KEY[status]),
    [statusT]
  );

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    return donations.filter((row) => {
      if (statusFilter !== ALL && row.status !== statusFilter) return false;
      const ts = new Date(row.created_at).getTime();
      if (fromMs !== null && ts < fromMs) return false;
      if (toMs !== null && ts > toMs) return false;
      if (term) {
        const haystack = `${row.donor_name ?? ''} ${row.email ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [donations, search, statusFilter, dateFrom, dateTo]);

  const summary = React.useMemo(() => {
    const completed = filtered.filter((row) => row.status === 'success');
    const pending = filtered.filter((row) => row.status === 'initiated');
    const totalGhs = completed.reduce((sum, row) => sum + Number(row.amount), 0);
    return {
      totalGhs,
      completedCount: completed.length,
      pendingCount: pending.length,
    };
  }, [filtered]);

  const handleResetFilters = React.useCallback(() => {
    setSearch('');
    setStatusFilter(ALL);
    setDateFrom('');
    setDateTo('');
  }, []);

  const handleExportCsv = React.useCallback(() => {
    const csv = buildCsv(filtered, locale, statusLabel, {
      donor: tableT('donor'),
      email: tableT('email'),
      amount: tableT('amount'),
      message: tableT('message'),
      reference: tableT('reference'),
      status: tableT('status'),
      date: tableT('date'),
      anonymous: tableT('anonymous'),
    }, currencyFmt);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportT('filename')}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filtered, locale, statusLabel, tableT, exportT, currencyFmt]);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== ALL ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
          {t('subtitle')}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t('title')}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={summaryT('total')}
          hint={summaryT('totalHint')}
          value={currencyFmt.format(summary.totalGhs)}
          icon={Wallet}
          iconClass="bg-gold-100 text-gold-700"
        />
        <SummaryCard
          label={summaryT('completed')}
          hint={summaryT('completedHint')}
          value={String(summary.completedCount)}
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-700"
        />
        <SummaryCard
          label={summaryT('pending')}
          hint={summaryT('pendingHint')}
          value={String(summary.pendingCount)}
          icon={Clock}
          iconClass="bg-amber-100 text-amber-700"
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="donation-search" className="sr-only">
                {t('search.label')}
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="donation-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={filtered.length === 0}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" aria-hidden />
                {exportT('csv')}
              </Button>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1.5 text-muted-foreground"
                >
                  <X className="h-4 w-4" aria-hidden />
                  {filtersT('reset')}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="filter-donation-status">{filtersT('status')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="filter-donation-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{filtersT('allStatuses')}</SelectItem>
                  {DONATION_STATUS_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {statusLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-donation-from">{filtersT('from')}</Label>
              <Input
                id="filter-donation-from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-donation-to">{filtersT('to')}</Label>
              <Input
                id="filter-donation-to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
          </div>

          {!loading && !loadError ? (
            <p className="text-xs text-muted-foreground">
              {resultsT('count', { count: filtered.length })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState message={t('loading')} />
          ) : loadError ? (
            <ErrorState message={loadError} />
          ) : filtered.length === 0 ? (
            <EmptyState message={resultsT('empty')} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tableT('donor')}</TableHead>
                    <TableHead>{tableT('email')}</TableHead>
                    <TableHead className="w-28">{tableT('amount')}</TableHead>
                    <TableHead className="min-w-[12rem]">
                      {tableT('message')}
                    </TableHead>
                    <TableHead className="min-w-[10rem]">
                      {tableT('reference')}
                    </TableHead>
                    <TableHead className="w-28">{tableT('status')}</TableHead>
                    <TableHead className="w-40">{tableT('date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.donor_name?.trim() || tableT('anonymous')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.email?.trim() || t('noValue')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold tabular-nums text-foreground">
                        {currencyFmt.format(Number(row.amount))}
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">
                        <span className="line-clamp-2">
                          {row.message?.trim() || t('noValue')}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.payment_reference}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            DONATION_STATUS_TONE[row.status]
                          )}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {dateFmt.format(new Date(row.created_at))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  hint,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  hint: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <span
          aria-hidden
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-lg',
            iconClass
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{message}</span>
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
        <HandCoins className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function buildCsv(
  rows: Donation[],
  locale: string,
  statusLabel: (s: DonationStatus) => string,
  headers: {
    donor: string;
    email: string;
    amount: string;
    message: string;
    reference: string;
    status: string;
    date: string;
    anonymous: string;
  },
  currencyFmt: Intl.NumberFormat
): string {
  const header = [
    headers.donor,
    headers.email,
    headers.amount,
    headers.message,
    headers.reference,
    headers.status,
    headers.date,
  ];

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Africa/Accra',
  });

  const lines: string[] = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.donor_name?.trim() || headers.anonymous,
        row.email?.trim() ?? '',
        currencyFmt.format(Number(row.amount)),
        row.message?.trim() ?? '',
        row.payment_reference,
        statusLabel(row.status),
        dateFmt.format(new Date(row.created_at)),
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return lines.join('\r\n');
}

function csvEscape(value: string): string {
  const needsQuotes = /[",\r\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
