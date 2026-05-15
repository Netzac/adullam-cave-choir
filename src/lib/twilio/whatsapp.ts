import twilio from 'twilio';

export type WhatsAppSendResult = { ok: true; sid: string } | { ok: false; error: string };

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

function formatWhatsAppTo(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith('233') ? digits : `233${digits.replace(/^0/, '')}`;
  return `whatsapp:+${withCountry}`;
}

export async function sendWhatsAppMessage(
  to: string,
  body: string,
): Promise<WhatsAppSendResult> {
  const client = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!client || !from) {
    return { ok: false, error: 'Twilio WhatsApp is not configured' };
  }

  try {
    const message = await client.messages.create({
      from,
      to: formatWhatsAppTo(to),
      body,
    });
    return { ok: true, sid: message.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Send failed';
    return { ok: false, error: message };
  }
}

export async function sendBulkWhatsApp(
  recipients: { phone: string; body: string }[],
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const result = await sendWhatsAppMessage(r.phone, r.body);
    if (result.ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}
