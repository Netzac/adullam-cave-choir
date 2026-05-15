'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime';
import type { AppNotification } from '@/types/database';
import {
  notificationIcon,
  notificationTone,
} from '@/components/admin/notificationDisplay';
import { useNotifications } from '@/hooks/useNotifications';

type ReadFilter = 'all' | 'unread' | 'read';

export default function AdminNotificationsPage() {
  const t = useTranslations('adminNotifications');
  const filtersT = useTranslations('adminNotifications.filters');
  const rt = useTranslations('adminNotifications.relativeTime');
  const errorsT = useTranslations('adminNotifications.errors');

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = React.useState<ReadFilter>('all');
  const [pendingAll, setPendingAll] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => !item.is_read);
    }
    if (filter === 'read') {
      return notifications.filter((item) => item.is_read);
    }
    return notifications;
  }, [notifications, filter]);

  const now = React.useMemo(() => Date.now(), [notifications]);

  const handleMarkAll = React.useCallback(async () => {
    if (pendingAll || unreadCount === 0) return;
    setPendingAll(true);
    try {
      await markAllAsRead();
    } catch {
      toast.error(errorsT('markAll'));
    } finally {
      setPendingAll(false);
    }
  }, [pendingAll, unreadCount, markAllAsRead, errorsT]);

  const handleItemClick = React.useCallback(
    async (item: AppNotification) => {
      if (item.is_read || pendingId) return;
      setPendingId(item.id);
      try {
        await markAsRead(item.id);
      } catch {
        toast.error(errorsT('markRead'));
      } finally {
        setPendingId(null);
      }
    },
    [pendingId, markAsRead, errorsT]
  );

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pendingAll || unreadCount === 0}
          onClick={handleMarkAll}
          className="gap-2"
        >
          {pendingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {t('actions.markAll')}
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div
            role="tablist"
            aria-label={t('title')}
            className="flex flex-wrap gap-1.5"
          >
            {(['all', 'unread', 'read'] as const).map((value) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-purple-700 bg-purple-700 text-white'
                      : 'border-border bg-background text-foreground/80 hover:bg-muted/60'
                  )}
                >
                  {filtersT(value)}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>{t('list.loading')}</span>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-sm text-rose-700">
              {errorsT('load')}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState message={t('list.empty')} />
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((item) => {
                const Icon = notificationIcon(item.type);
                const isPending = pendingId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 sm:px-6',
                        !item.is_read && 'bg-gold-50/40 dark:bg-gold-950/15',
                        isPending && 'opacity-70'
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          notificationTone(item.type)
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-sm font-semibold',
                            item.is_read
                              ? 'text-muted-foreground'
                              : 'text-foreground'
                          )}
                        >
                          {item.title}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 block text-sm',
                            item.is_read
                              ? 'text-muted-foreground'
                              : 'text-foreground/90'
                          )}
                        >
                          {item.message}
                        </span>
                        <span className="mt-1.5 block text-xs text-muted-foreground">
                          {formatRelativeTime(now, item.created_at, rt)}
                        </span>
                      </span>
                      {!item.is_read ? (
                        <span
                          aria-hidden
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-600"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
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
        <Bell className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
