import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema } from '@/lib/validations/contactSchema';
import { siteConfig } from '@/config/site';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${siteConfig.name} <${siteConfig.contact.email}>`,
        to: siteConfig.contact.email,
        replyTo: data.email,
        subject: `New contact form: ${data.subject}`,
        html: `
          <p><strong>From:</strong> ${data.full_name} &lt;${data.email}&gt;</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          <p><strong>Subject:</strong> ${data.subject}</p>
          <hr />
          <p>${data.message.replace(/\n/g, '<br/>')}</p>
        `,
      });
    } catch (err) {
      console.error('[api/contact] email failed', err);
      return NextResponse.json({ error: 'Could not send message' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
