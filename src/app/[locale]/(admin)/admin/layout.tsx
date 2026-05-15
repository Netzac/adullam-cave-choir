import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface AdminGroupLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AdminGroupLayout({
  children,
}: AdminGroupLayoutProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The root middleware redirects unauthenticated requests to /admin/login
  // before this layout runs. When there is no session here, we are on the
  // login route itself — render children without the admin shell.
  if (!user) {
    return <>{children}</>;
  }

  const metadata = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
  const displayName =
    metadata.full_name?.trim() ||
    metadata.name?.trim() ||
    user.email?.split('@')[0] ||
    'Admin';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <AdminLayout
      user={{
        name: displayName,
        email: user.email ?? '',
        avatarUrl: metadata.avatar_url ?? null,
        role: profile?.role ?? 'admin',
      }}
    >
      {children}
    </AdminLayout>
  );
}
