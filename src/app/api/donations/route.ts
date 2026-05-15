import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { donationSchema } from '@/lib/validations/donationSchema';
import { createAdminClient } from '@/lib/supabase/server';
import { initializeTransaction } from '@/lib/paystack';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = donationSchema.safeParse(body);
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

  let reference = `don_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  let authorizationUrl: string | null = null;

  if (!data.email) {
    return NextResponse.json({ error: 'Email is required for payment' }, { status: 422 });
  }

  const init = await initializeTransaction({
    email: data.email,
    amount: data.amount,
    currency: data.currency || 'GHS',
    reference,
    metadata: {
      payment_type: 'donation',
      donor_name: data.donor_name || null,
      donor_email: data.email,
      phone: data.phone || null,
      locale,
    },
  });

  if (init) {
    reference = init.reference;
    authorizationUrl = init.authorizationUrl;
  }

  if (hasSupabase) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from('donations').insert({
        donor_name: data.donor_name || null,
        email: data.email || null,
        phone: data.phone || null,
        amount: data.amount,
        currency: data.currency || 'GHS',
        message: data.message || null,
        payment_reference: reference,
        status: 'initiated',
      });
      if (error) throw error;
    } catch (err) {
      console.error('[api/donations] supabase insert failed', err);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      reference,
      authorizationUrl,
      configured: !!process.env.PAYSTACK_SECRET_KEY,
    },
    { status: 201 },
  );
}
