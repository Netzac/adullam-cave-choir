'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Plus, Search, Settings2, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { EquipmentRecord } from '@/types/database';
import { EQUIPMENT_STATUS_TONE } from '@/components/admin/equipmentStatus';

export default function AdminEquipmentPage() {
  const locale = useLocale();
  const t = useTranslations('adminEquipment.list');
  const statusT = useTranslations('adminEquipment.status');
  const actionsT = useTranslations('adminEquipment.list.actions');
  const errorsT = useTranslations('adminEquipment.list.errors');

  const [records, setRecords] = React.useState<EquipmentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    supabase
      .from('equipment_records')
      .select('*')
      .order('service_date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load equipment records', error);
          setLoadError(errorsT('load'));
          setRecords([]);
        } else {
          setRecords((data ?? []) as EquipmentRecord[]);
          setLoadError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [errorsT]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => {
      const hay = `${record.church_name} ${record.location}`.toLowerCase();
      return hay.includes(term);
    });
  }, [records, search]);

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeZone: 'Africa/Accra',
      }),
    [locale]
  );

  const hasFilter = search.trim() !== '';

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
          <Link href="/admin/equipment/new">
            <Plus className="h-4 w-4" aria-hidden />
            {t('createCta')}
          </Link>
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="equipment-search" className="sr-only">
                {t('search.label')}
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="equipment-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-9"
                />
              </div>
            </div>
            {hasFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearch('')}
                className="gap-1.5 text-muted-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
                {t('reset')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState message={t('loading')} />
          ) : loadError ? (
            <ErrorState message={loadError} />
          ) : filtered.length === 0 ? (
            <EmptyState message={t('empty')} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.church')}</TableHead>
                    <TableHead>{t('table.location')}</TableHead>
                    <TableHead className="w-36">
                      {t('table.serviceDate')}
                    </TableHead>
                    <TableHead className="w-32">{t('table.status')}</TableHead>
                    <TableHead className="w-28 text-right">
                      {t('table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/equipment/${record.id}`}
                          className="text-foreground hover:text-gold-600 hover:underline underline-offset-4"
                        >
                          {record.church_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.location}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dateFmt.format(new Date(record.service_date))}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            EQUIPMENT_STATUS_TONE[record.status]
                          )}
                        >
                          {statusT(record.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          type="button"
                          variant="outline"
                          size="sm"
                        >
                          <Link href={`/admin/equipment/${record.id}`}>
                            {actionsT('edit')}
                          </Link>
                        </Button>
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
        <Settings2 className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
