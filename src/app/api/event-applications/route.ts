import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { eventApplicationSchema } from '@/lib/validations/eventApplicationSchema';
import { createAdminClient } from '@/lib/supabase/server';
import { initializeTransaction } from '@/lib/paystack';
import { siteConfig } from '@/config/site';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = eventApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const locale =
    typeof body === 'object' && body !== null && 'locale' in body
      ? String((body as { locale?: string }).locale)
      : 'en';

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasSupabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const supabase = createAdminClient();

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, fee, currency, status')
    .eq('id', data.event_id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.status !== 'scheduled' && event.status !== 'live') {
    return NextResponse.json({ error: 'Event is not open for registration' }, { status: 400 });
  }

  const fee = Number(event.fee) || 0;
  let paymentReference = `evt_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  let authorizationUrl: string | null = null;

  const { data: row, error: insertError } = await supabase
    .from('event_applications')
    .insert({
      event_id: data.event_id,
      full_name: data.full_name,
      organization: data.organization || null,
      email: data.email,
      phone: data.phone,
      message: data.message || null,
      status: fee > 0 ? 'pending' : 'confirmed',
      payment_reference: fee > 0 ? paymentReference : null,
      payment_status: fee > 0 ? 'initiated' : 'success',
    })
    .select('id')
    .single();

  if (insertError || !row) {
    console.error('[api/event-applications] insert failed', insertError);
    return NextResponse.json({ error: 'Could not save registration' }, { status: 500 });
  }

  if (fee > 0) {
    const init = await initializeTransaction({
      email: data.email,
      amount: fee,
      currency: event.currency ?? 'GHS',
      reference: paymentReference,
      callback_url: `${siteConfig.url}/events?payment=success`,
      metadata: {
        payment_type: 'event_application',
        event_application_id: row.id,
        event_id: data.event_id,
        full_name: data.full_name,
        email: data.email,
        locale,
      },
    });

    if (!init) {
      await supabase.from('event_applications').delete().eq('id', row.id);
      return NextResponse.json({ error: 'Payment initialization failed' }, { status: 502 });
    }

    paymentReference = init.reference;
    authorizationUrl = init.authorizationUrl;

    await supabase
      .from('event_applications')
      .update({ payment_reference: paymentReference })
      .eq('id', row.id);
  }

  return NextResponse.json(
    {
      ok: true,
      id: row.id,
      requiresPayment: fee > 0,
      reference: paymentReference,
      authorizationUrl,
    },
    { status: 201 },
  );
}
