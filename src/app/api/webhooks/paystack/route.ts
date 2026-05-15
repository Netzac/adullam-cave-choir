import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/server';
import { getPaymentConfirmationEmail } from '@/lib/email/messages';
import { siteConfig } from '@/config/site';
import { Resend } from 'resend';

export const runtime = 'nodejs';

function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event !== 'charge.success' || !event.data?.reference) {
    return NextResponse.json({ ok: true });
  }

  const reference = event.data.reference;
  const verified = await verifyTransaction(reference);
  if (!verified.ok) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }

  const meta = verified.metadata;
  const paymentType = typeof meta.payment_type === 'string' ? meta.payment_type : 'donation';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();

  if (paymentType === 'event_application') {
    const applicationId = typeof meta.event_application_id === 'string' ? meta.event_application_id : null;
    if (applicationId) {
      await supabase
        .from('event_applications')
        .update({ payment_status: 'success', status: 'confirmed' })
        .eq('id', applicationId)
        .eq('payment_reference', reference);
    }
  } else {
    await supabase
      .from('donations')
      .update({ status: 'success' })
      .eq('payment_reference', reference);
  }

  const email =
    typeof meta.email === 'string'
      ? meta.email
      : typeof meta.donor_email === 'string'
        ? meta.donor_email
        : null;
  const name =
    typeof meta.donor_name === 'string'
      ? meta.donor_name
      : typeof meta.full_name === 'string'
        ? meta.full_name
        : 'Friend';

  if (email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const locale = typeof meta.locale === 'string' ? meta.locale : 'en';
      const mail = getPaymentConfirmationEmail(locale, {
        name,
        amount: String(verified.amount),
        currency: verified.currency,
        reference,
      });
      await resend.emails.send({
        from: `${siteConfig.name} <${siteConfig.contact.email}>`,
        to: email,
        subject: mail.subject,
        html: mail.html,
      });
    } catch (err) {
      console.error('[webhooks/paystack] confirmation email failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}
