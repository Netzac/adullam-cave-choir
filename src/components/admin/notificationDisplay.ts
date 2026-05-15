import type { ComponentType } from 'react';
import {
  CalendarRange,
  MessageSquare,
  RefreshCw,
  UserPlus,
  Wallet,
} from 'lucide-react';
import type { NotificationType } from '@/types/database';

/** Visual groups aligned with phase4-9 spec. */
export type NotificationDisplayGroup =
  | 'new_application'
  | 'new_donation'
  | 'new_contact'
  | 'status_change';

export function notificationDisplayGroup(
  type: NotificationType
): NotificationDisplayGroup {
  switch (type) {
    case 'donation':
      return 'new_donation';
    case 'contact':
      return 'new_contact';
    case 'system':
      return 'status_change';
    case 'application':
    case 'event_application':
    default:
      return 'new_application';
  }
}

export function notificationIcon(
  type: NotificationType
): ComponentType<{ className?: string }> {
  switch (notificationDisplayGroup(type)) {
    case 'new_donation':
      return Wallet;
    case 'new_contact':
      return MessageSquare;
    case 'status_change':
      return RefreshCw;
    case 'new_application':
    default:
      return type === 'event_application' ? CalendarRange : UserPlus;
  }
}

/** Icon container tones: blue, green, yellow, purple per spec. */
export function notificationTone(type: NotificationType): string {
  switch (notificationDisplayGroup(type)) {
    case 'new_donation':
      return 'bg-emerald-100 text-emerald-700';
    case 'new_contact':
      return 'bg-amber-100 text-amber-800';
    case 'status_change':
      return 'bg-purple-100 text-purple-700';
    case 'new_application':
    default:
      return 'bg-sky-100 text-sky-700';
  }
}
