import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { applicationSchema } from '@/lib/validations/applicationSchema';
import { createAdminClient } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';
import { getApplicationReceivedEmail } from '@/lib/email/messages';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
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
      : null;

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  let savedId: string | null = null;

  if (hasSupabase) {
    try {
      const supabase = createAdminClient();
      const { data: row, error } = await supabase
        .from('applications')
        .insert({
          full_name: data.full_name,
          age: data.age,
          phone: data.phone,
          email: data.email || null,
          interest_level: data.interest_level,
          experience: data.experience || null,
          preferred_program: data.preferred_program,
          guardian_consent: data.guardian_consent,
          notes: data.notes || null,
          passport_photo_url: data.passport_photo_url || null,
        })
        .select('id')
        .single();
      if (error) throw error;
      savedId = row?.id ?? null;
    } catch (err) {
      console.error('[api/applications] supabase insert failed', err);
      return NextResponse.json({ error: 'Could not save application' }, { status: 500 });
    }
  }

  if (process.env.RESEND_API_KEY && data.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const email = getApplicationReceivedEmail(locale, data.full_name);
      await resend.emails.send({
        from: `${siteConfig.name} <${siteConfig.contact.email}>`,
        to: data.email,
        subject: email.subject,
        html: email.html,
      });
    } catch (err) {
      console.error('[api/applications] email failed', err);
    }
  }

  return NextResponse.json({ ok: true, id: savedId }, { status: 201 });
}
