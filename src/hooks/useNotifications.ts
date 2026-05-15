'use client';

import * as React from 'react';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import * as notificationQueries from '@/lib/supabase/queries/notifications';
import type { AppNotification } from '@/types/database';

function applyRealtimeChange(
  prev: AppNotification[],
  payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>
): AppNotification[] {
  if (payload.eventType === 'INSERT') {
    const row = payload.new as AppNotification;
    if (prev.some((item) => item.id === row.id)) return prev;
    return [row, ...prev].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  if (payload.eventType === 'UPDATE') {
    const row = payload.new as AppNotification;
    return prev.map((item) => (item.id === row.id ? row : item));
  }
  if (payload.eventType === 'DELETE') {
    const row = payload.old as { id?: string };
    if (!row.id) return prev;
    return prev.filter((item) => item.id !== row.id);
  }
  return prev;
}

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const supabaseRef = React.useRef(createClient());
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  const loadNotifications = React.useCallback(async () => {
    const supabase = supabaseRef.current;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthenticated(false);
      setNotifications([]);
      setError(null);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    const data = await notificationQueries.getAll(supabase);
    setNotifications(data);
    setError(null);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      setLoading(true);
      try {
        await loadNotifications();
        if (cancelled) return;

        const supabase = supabaseRef.current;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
          .channel(`admin-notifications:${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            (payload) => {
              setNotifications((prev) => applyRealtimeChange(prev, payload));
            }
          )
          .subscribe();

        channelRef.current = channel;
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load notifications', err);
          setError(err instanceof Error ? err.message : 'load_failed');
          setLoading(false);
        }
      }
    };

    void setup();

    return () => {
      cancelled = true;
      const supabase = supabaseRef.current;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadNotifications]);

  const unreadCount = React.useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const markAsRead = React.useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
    try {
      await notificationQueries.markAsRead(supabaseRef.current, id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      await loadNotifications();
      throw err;
    }
  }, [loadNotifications]);

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true }))
    );
    try {
      await notificationQueries.markAllAsRead(supabaseRef.current);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
      await loadNotifications();
      throw err;
    }
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isAuthenticated,
    markAsRead,
    markAllAsRead,
  };
}
