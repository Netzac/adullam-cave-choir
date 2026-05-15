'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Application, EventApplication } from '@/types/database';

export default function MemberPortalPage() {
  const t = useTranslations('memberPortal');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [signingIn, setSigningIn] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);
  const [application, setApplication] = React.useState<Application | null>(null);
  const [events, setEvents] = React.useState<EventApplication[]>([]);

  const loadMemberData = React.useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setSignedIn(false);
      setLoading(false);
      return;
    }

    setSignedIn(true);
    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .eq('portal_enabled', true)
      .ilike('email', user.email)
      .limit(1);

    setApplication((apps?.[0] as Application) ?? null);

    const { data: eventApps } = await supabase
      .from('event_applications')
      .select('*')
      .ilike('email', user.email)
      .in('status', ['confirmed', 'attended']);

    setEvents((eventApps ?? []) as EventApplication[]);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadMemberData();
  }, [loadMemberData]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSigningIn(false);
    if (!error) await loadMemberData();
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSignedIn(false);
    setApplication(null);
    setEvents([]);
  };

  if (loading) {
    return <p className="container py-20 text-muted-foreground">{t('loading')}</p>;
  }

  if (!signedIn) {
    return (
      <div className="container max-w-md py-20">
        <Card>
          <CardHeader>
            <CardTitle>{t('loginTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="portal-email">{t('email')}</Label>
                <Input
                  id="portal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="portal-password">{t('password')}</Label>
                <Input
                  id="portal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={signingIn} className="w-full">
                {signingIn ? t('signingIn') : t('signIn')}
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">{t('loginHint')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl space-y-8 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold">{t('dashboardTitle')}</h1>
        <Button type="button" variant="outline" onClick={() => void signOut()}>
          {t('signOut')}
        </Button>
      </div>

      {application ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('applicationStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t('program')}:</span>{' '}
              {application.preferred_program}
            </p>
            <p>
              <span className="text-muted-foreground">{t('status')}:</span>{' '}
              <span className="font-medium capitalize">{application.status}</span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">{t('noApplication')}</p>
      )}

      {events.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {events.map((ev) => (
                <li key={ev.id} className="rounded-lg border border-border/60 p-3">
                  <p className="font-medium capitalize">{ev.status}</p>
                  <p className="text-muted-foreground">{ev.phone}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
