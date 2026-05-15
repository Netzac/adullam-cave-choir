import type { UserRole } from '@/types/database';

export type AdminPermission =
  | 'dashboard'
  | 'applications'
  | 'events'
  | 'gallery'
  | 'blog'
  | 'equipment'
  | 'donations'
  | 'notifications'
  | 'settings'
  | 'team'
  | 'analytics'
  | 'whatsapp_bulk';

type RolePermissions = AdminPermission[] | readonly ['all'];

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: ['all'],
  admin: ['all'],
  editor: ['dashboard', 'gallery', 'blog', 'notifications'],
  content_manager: ['dashboard', 'gallery', 'blog', 'notifications', 'settings'],
  workshop_coordinator: [
    'dashboard',
    'applications',
    'events',
    'donations',
    'notifications',
    'analytics',
    'whatsapp_bulk',
  ],
};

export function normalizeRole(role: UserRole | string | null | undefined): UserRole {
  if (role === 'content_manager' || role === 'workshop_coordinator') {
    return role;
  }
  if (role === 'super_admin' || role === 'admin' || role === 'editor') {
    return role;
  }
  return 'admin';
}

export function hasPermission(
  role: UserRole | string | null | undefined,
  permission: AdminPermission,
): boolean {
  const normalized = normalizeRole(role);
  const perms = ROLE_PERMISSIONS[normalized];
  if (perms[0] === 'all') return true;
  return (perms as AdminPermission[]).includes(permission);
}

export function canAccessNav(
  role: UserRole | string | null | undefined,
  navKey: string,
): boolean {
  const map: Record<string, AdminPermission> = {
    dashboard: 'dashboard',
    applications: 'applications',
    events: 'events',
    gallery: 'gallery',
    blog: 'blog',
    equipment: 'equipment',
    donations: 'donations',
    notifications: 'notifications',
    settings: 'settings',
  };
  const permission = map[navKey];
  if (!permission) return false;
  return hasPermission(role, permission);
}

export function isSuperAdmin(role: UserRole | string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === 'super_admin' || r === 'admin';
}
