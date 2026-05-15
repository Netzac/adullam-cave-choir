import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/twilio/whatsapp';
import { siteConfig } from '@/config/site';

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
    return NextResponse.json({ ok: true, sent: 0, skipped: 'no supabase' });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = tomorrow.toISOString().slice(0, 10);

  const supabase = createAdminClient();
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title, date, time, venue')
    .eq('date', targetDate)
    .in('status', ['scheduled', 'live']);

  if (eventsError || !events?.length) {
    return NextResponse.json({ ok: true, sent: 0, events: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const event of events) {
    const { data: applicants } = await supabase
      .from('event_applications')
      .select('full_name, phone')
      .eq('event_id', event.id)
      .eq('status', 'confirmed');

    for (const applicant of applicants ?? []) {
      const body = `Hello ${applicant.full_name}, reminder from ${siteConfig.name}: "${event.title}" is tomorrow (${event.date}) at ${event.venue}. We look forward to seeing you!`;
      const result = await sendWhatsAppMessage(applicant.phone, body);
      if (result.ok) sent += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, events: events.length });
}
