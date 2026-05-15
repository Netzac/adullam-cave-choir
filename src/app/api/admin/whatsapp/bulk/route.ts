import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { sendBulkWhatsApp } from '@/lib/twilio/whatsapp';
import { hasPermission } from '@/lib/auth/roles';

const bulkSchema = z.object({
  event_id: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
});

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasPermission(profile?.role, 'whatsapp_bulk')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 });
  }

  const { data: applicants, error } = await supabase
    .from('event_applications')
    .select('phone, full_name')
    .eq('event_id', parsed.data.event_id)
    .eq('status', 'confirmed');

  if (error) {
    return NextResponse.json({ error: 'Could not load applicants' }, { status: 500 });
  }

  const recipients = (applicants ?? []).map((a) => ({
    phone: a.phone,
    body: `Hi ${a.full_name}, ${parsed.data.message}`,
  }));

  const result = await sendBulkWhatsApp(recipients);
  return NextResponse.json({ ok: true, ...result });
}
