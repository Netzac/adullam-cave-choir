import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import { Resend } from 'resend';
import en from '@/i18n/en.json';

export const runtime = 'nodejs';

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, count: 0, skipped: 'no supabase' });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', cutoff.toISOString());

  if (error) {
    console.error('[cron/pending-applications]', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const count = data?.length ?? 0;
  if (count === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const copy = en.emails.pendingApplicationsReminder;
      await resend.emails.send({
        from: `${siteConfig.name} <${siteConfig.contact.email}>`,
        to: siteConfig.contact.email,
        subject: copy.subject,
        html: `<p>${copy.body.replace('{count}', String(count))}</p>`,
      });
    } catch (err) {
      console.error('[cron/pending-applications] email failed', err);
    }
  }

  return NextResponse.json({ ok: true, count });
}
