'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime';
import type { AppNotification } from '@/types/database';
import {
  notificationIcon,
  notificationTone,
} from '@/components/admin/notificationDisplay';

interface NotificationBellMenuProps {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  className?: string;
}

export function NotificationBellMenu({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NotificationBellMenuProps) {
  const t = useTranslations('adminNotifications.bell');
  const rt = useTranslations('adminNotifications.relativeTime');
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const recent = React.useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  const now = React.useMemo(() => Date.now(), [notifications, open]);

  const handleMarkAll = React.useCallback(async () => {
    if (pending || unreadCount === 0) return;
    setPending(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setPending(false);
    }
  }, [pending, unreadCount, onMarkAllAsRead]);

  const handleItemClick = React.useCallback(
    async (item: AppNotification) => {
      if (item.is_read) return;
      try {
        await onMarkAsRead(item.id);
      } catch {
        // Parent hook reloads on failure.
      }
    },
    [onMarkAsRead]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t('label')}
          className={cn(
            'relative h-9 w-9 border-border/60 bg-background text-foreground/80 hover:bg-accent/30',
            className
          )}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold leading-[1.1rem] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] p-0"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <p className="text-sm font-semibold text-foreground">
            {t('label')}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending || unreadCount === 0}
            onClick={handleMarkAll}
            className="h-auto px-2 py-1 text-xs text-muted-foreground"
          >
            {t('markAll')}
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            </div>
          ) : recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('empty')}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map((item) => {
                const Icon = notificationIcon(item.type);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50',
                        !item.is_read && 'bg-gold-50/50 dark:bg-gold-950/20'
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
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'line-clamp-2 text-sm',
                            item.is_read
                              ? 'text-muted-foreground'
                              : 'font-medium text-foreground'
                          )}
                        >
                          {item.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {formatRelativeTime(now, item.created_at, rt)}
                        </span>
                      </span>
                      {!item.is_read ? (
                        <span
                          aria-hidden
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-600"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border/60 p-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sm"
            onClick={() => setOpen(false)}
          >
            <Link href="/admin/notifications">{t('viewAll')}</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
