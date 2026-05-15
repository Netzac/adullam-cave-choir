'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Bell,
  CalendarRange,
  FileText,
  HandCoins,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Speaker,
  Users,
  X,
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { NotificationBellMenu } from '@/components/admin/NotificationBellMenu';
import { useNotifications } from '@/hooks/useNotifications';
import { canAccessNav, isSuperAdmin } from '@/lib/auth/roles';
import type { UserRole } from '@/types/database';

interface AdminUser {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  user: AdminUser;
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/applications', labelKey: 'applications', icon: Users },
  { href: '/admin/events', labelKey: 'events', icon: CalendarRange },
  { href: '/admin/gallery', labelKey: 'gallery', icon: ImageIcon },
  { href: '/admin/blog', labelKey: 'blog', icon: Newspaper },
  { href: '/admin/equipment', labelKey: 'equipment', icon: Speaker },
  { href: '/admin/donations', labelKey: 'donations', icon: HandCoins },
  { href: '/admin/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/admin/settings', labelKey: 'settings', icon: Settings },
  { href: '/admin/team', labelKey: 'team', icon: FileText },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const t = useTranslations('adminLayout');
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = React.useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }, [router, signingOut]);

  const isActive = React.useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0F0A1E] text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
        <Link
          href="/admin/dashboard"
          aria-label="Adullam Cave Choir — Admin"
          className="group inline-flex items-center gap-3"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand font-serif text-base font-bold text-white shadow-glow ring-1 ring-white/10 transition-transform group-hover:scale-105"
          >
            A
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-base font-semibold tracking-tight text-white">
              Adullam Cave
            </span>
            <span className="text-[11px] uppercase tracking-[0.24em] text-gold-300/80">
              {t('panel')}
            </span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={t('closeSidebar')}
          onClick={() => setMobileOpen(false)}
          className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav
        aria-label="Admin primary"
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.filter((item) => {
            if (item.labelKey === 'team') return isSuperAdmin(user.role);
            return canAccessNav(user.role, item.labelKey);
          }).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isNotifications = item.labelKey === 'notifications';
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-gold-500/15 text-gold-300 shadow-[inset_2px_0_0_0_#D97706]'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 transition-colors',
                      active ? 'text-gold-300' : 'text-white/60 group-hover:text-white'
                    )}
                  />
                  <span className="flex-1 truncate">
                    {t(`nav.${item.labelKey}`)}
                  </span>
                  {isNotifications && unreadCount > 0 ? (
                    <span
                      aria-label={t('unreadCount', { count: unreadCount })}
                      className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold leading-5 text-white"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-white/15">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-purple-800 text-white">
              {initials(user.name) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-white/55">{user.email}</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          variant="ghost"
          className="mt-3 w-full justify-start gap-2 border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? t('signingOut') : t('signOut')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-light dark:bg-[#0A0617]">
      <aside
        aria-label="Admin sidebar"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 lg:block"
      >
        {sidebarContent}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={t('openSidebar')}
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background text-foreground/80 transition hover:bg-accent/30 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/admin/dashboard"
              className="font-serif text-base font-semibold tracking-tight lg:hidden"
            >
              {t('panel')}
            </Link>
          </div>
          <NotificationBellMenu
            notifications={notifications}
            unreadCount={unreadCount}
            loading={notificationsLoading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="admin-mobile-overlay"
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label={t('closeSidebar')}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 left-0 w-72 max-w-[88%] shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
