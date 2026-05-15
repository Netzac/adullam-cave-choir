'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/types/database';
import { isSuperAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const ASSIGNABLE_ROLES: UserRole[] = [
  'super_admin',
  'content_manager',
  'workshop_coordinator',
  'editor',
  'admin',
];

export default function AdminTeamPage() {
  const t = useTranslations('adminTeam');
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [myRole, setMyRole] = React.useState<UserRole | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: me } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setMyRole((me?.role as UserRole) ?? 'admin');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(t('errors.load'));
      } else {
        setProfiles((data ?? []) as Profile[]);
      }
      setLoading(false);
    })();
  }, [t]);

  const updateRole = async (id: string, role: UserRole) => {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) {
      toast.error(t('errors.save'));
      return;
    }
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
    toast.success(t('saved'));
  };

  if (!isSuperAdmin(myRole)) {
    return (
      <p className="rounded-lg border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
        {t('forbidden')}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.name')}</TableHead>
                  <TableHead>{t('columns.email')}</TableHead>
                  <TableHead>{t('columns.role')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.full_name ?? '—'}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Select
                        value={profile.role}
                        onValueChange={(v) => void updateRole(profile.id, v as UserRole)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {t(`roles.${role}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
