'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  Search,
  Users,
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
import type { Application, ApplicationStatus } from '@/types/database';
import { ApplicationDetailDrawer } from '@/components/admin/ApplicationDetailDrawer';
import {
  APPLICATION_STATUS_LABEL_KEY,
  APPLICATION_STATUS_TONE,
  EDITABLE_APPLICATION_STATUSES,
  formatApplicationDate,
} from '@/components/admin/applicationStatus';

const PAGE_SIZE = 10;
const ALL = '__all__';

export default function AdminApplicationsPage() {
  const locale = useLocale();
  const t = useTranslations('adminApplications');
  const tableT = useTranslations('adminApplications.table');
  const filtersT = useTranslations('adminApplications.filters');
  const statusT = useTranslations('adminApplications.status');
  const resultsT = useTranslations('adminApplications.results');
  const pagT = useTranslations('adminApplications.pagination');
  const exportT = useTranslations('adminApplications.export');

  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Filter state
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [programFilter, setProgramFilter] = React.useState<string>(ALL);
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [page, setPage] = React.useState(1);

  // Drawer state
  const [selected, setSelected] = React.useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Fetch all applications once; filtering and paging happen client-side so
  // CSV export and filter feedback are instantaneous.
  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);
    supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load applications', error);
          setLoadError(error.message);
          setApplications([]);
        } else {
          setApplications((data ?? []) as Application[]);
          setLoadError(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset to page 1 whenever filter inputs change.
  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, programFilter, dateFrom, dateTo]);

  // Distinct program list, derived from data.
  const programs = React.useMemo(() => {
    const set = new Set<string>();
    for (const row of applications) {
      if (row.preferred_program) set.add(row.preferred_program);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  // Apply filters + search.
  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    return applications.filter((row) => {
      if (statusFilter !== ALL && row.status !== statusFilter) return false;
      if (programFilter !== ALL && row.preferred_program !== programFilter) {
        return false;
      }
      const ts = new Date(row.created_at).getTime();
      if (fromMs !== null && ts < fromMs) return false;
      if (toMs !== null && ts > toMs) return false;
      if (term) {
        const haystack = `${row.full_name} ${row.email ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [applications, search, statusFilter, programFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(sliceStart, sliceStart + PAGE_SIZE);

  const handleRowClick = React.useCallback((row: Application) => {
    setSelected(row);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = React.useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleSaved = React.useCallback(
    (updated: Application) => {
      setApplications((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );
      setSelected(updated);
    },
    []
  );

  const handleResetFilters = React.useCallback(() => {
    setSearch('');
    setStatusFilter(ALL);
    setProgramFilter(ALL);
    setDateFrom('');
    setDateTo('');
  }, []);

  const handleExportCsv = React.useCallback(() => {
    const labelFor = (status: ApplicationStatus) =>
      statusT(APPLICATION_STATUS_LABEL_KEY[status]);
    const csv = buildCsv(filtered, locale, labelFor);
    const blob = new Blob([`﻿${csv}`], {
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
  }, [filtered, locale, statusT, exportT]);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== ALL ||
    programFilter !== ALL ||
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

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="application-search" className="sr-only">
                {t('search.label')}
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="application-search"
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
              <Label htmlFor="filter-status">{filtersT('status')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{filtersT('allStatuses')}</SelectItem>
                  {EDITABLE_APPLICATION_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {statusT(APPLICATION_STATUS_LABEL_KEY[value])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-program">{filtersT('program')}</Label>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger id="filter-program">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{filtersT('allPrograms')}</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-date-from">{filtersT('from')}</Label>
              <Input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-date-to">{filtersT('to')}</Label>
              <Input
                id="filter-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
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
            <EmptyState message={resultsT('empty')} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tableT('name')}</TableHead>
                      <TableHead className="w-16">{tableT('age')}</TableHead>
                      <TableHead>{tableT('program')}</TableHead>
                      <TableHead className="w-36">{tableT('status')}</TableHead>
                      <TableHead className="w-36">{tableT('date')}</TableHead>
                      <TableHead className="w-24 text-right">
                        {tableT('actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((row) => (
                      <TableRow
                        key={row.id}
                        role="button"
                        tabIndex={0}
                        aria-label={tableT('openRow', { name: row.full_name })}
                        onClick={() => handleRowClick(row)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleRowClick(row);
                          }
                        }}
                        className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:outline-none"
                      >
                        <TableCell className="font-medium text-foreground">
                          <div className="flex flex-col">
                            <span>{row.full_name}</span>
                            {row.email ? (
                              <span className="text-xs text-muted-foreground">
                                {row.email}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.age}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.preferred_program}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              APPLICATION_STATUS_TONE[row.status]
                            )}
                          >
                            {statusT(APPLICATION_STATUS_LABEL_KEY[row.status])}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatApplicationDate(row.created_at, locale)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRowClick(row);
                            }}
                          >
                            {tableT('view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-muted-foreground">
                  {resultsT('showing', {
                    from: filtered.length === 0 ? 0 : sliceStart + 1,
                    to: sliceStart + paginated.length,
                    total: filtered.length,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {pagT('page', { page: safePage, totalPages })}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    {pagT('previous')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage >= totalPages}
                    className="gap-1"
                  >
                    {pagT('next')}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDrawer
        application={selected}
        open={drawerOpen}
        locale={locale}
        onClose={handleDrawerClose}
        onSaved={handleSaved}
      />
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
      <Filter className="sr-only h-4 w-4" aria-hidden />
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
        <Users className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV export
// ─────────────────────────────────────────────────────────────────────────────

function buildCsv(
  rows: Application[],
  locale: string,
  statusLabel: (s: ApplicationStatus) => string
): string {
  const header = [
    'Full Name',
    'Age',
    'Phone',
    'Email',
    'Interest Level',
    'Preferred Program',
    'Guardian Consent',
    'Status',
    'Submitted',
    'Notes',
    'Internal Notes',
  ];

  const lines: string[] = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.full_name,
        String(row.age),
        row.phone,
        row.email ?? '',
        row.interest_level,
        row.preferred_program,
        row.guardian_consent ? 'Yes' : 'No',
        statusLabel(row.status),
        formatApplicationDate(row.created_at, locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        row.notes ?? '',
        row.internal_notes ?? '',
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
