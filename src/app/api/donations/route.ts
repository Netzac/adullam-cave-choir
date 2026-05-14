import { NextResponse } from 'next/server';
import { donationSchema } from '@/lib/validations/donationSchema';
import { createAdminClient } from '@/lib/supabase/server';

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

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasPaystack = !!process.env.PAYSTACK_SECRET_KEY;

  let reference: string | null = null;
  let authorizationUrl: string | null = null;

  if (hasPaystack && data.email) {
    try {
      const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          amount: Math.round(data.amount * 100),
          currency: data.currency || 'GHS',
          metadata: {
            donor_name: data.donor_name || null,
            phone: data.phone || null,
            message: data.message || null,
          },
        }),
      });
      const json = (await initRes.json()) as {
        status?: boolean;
        data?: { reference?: string; authorization_url?: string };
      };
      if (json?.status && json.data) {
        reference = json.data.reference ?? null;
        authorizationUrl = json.data.authorization_url ?? null;
      }
    } catch (err) {
      console.error('[api/donations] paystack init failed', err);
    }
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
        payment_reference: reference ?? '',
      });
      if (error) throw error;
    } catch (err) {
      console.error('[api/donations] supabase insert failed', err);
    }
  }

  return NextResponse.json(
    { ok: true, reference, authorizationUrl, configured: hasPaystack },
    { status: 201 },
  );
}
