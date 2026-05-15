const PAYSTACK_BASE = 'https://api.paystack.co';

export type PaystackInitPayload = {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
};

export type PaystackInitResult = {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
};

export async function initializeTransaction(
  payload: PaystackInitPayload,
): Promise<PaystackInitResult | null> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return null;

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      amount: Math.round(payload.amount * 100),
      currency: payload.currency ?? 'GHS',
      reference: payload.reference,
      metadata: payload.metadata,
      callback_url: payload.callback_url,
    }),
  });

  const json = (await res.json()) as {
    status?: boolean;
    data?: {
      reference?: string;
      authorization_url?: string;
      access_code?: string;
    };
  };

  if (!json.status || !json.data?.reference || !json.data.authorization_url) {
    return null;
  }

  return {
    reference: json.data.reference,
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code ?? '',
  };
}

export async function verifyTransaction(reference: string): Promise<{
  ok: boolean;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
}> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { ok: false, amount: 0, currency: 'GHS', metadata: {} };
  }

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  );

  const json = (await res.json()) as {
    status?: boolean;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };
  };

  const success = json.status === true && json.data?.status === 'success';
  return {
    ok: success,
    amount: (json.data?.amount ?? 0) / 100,
    currency: json.data?.currency ?? 'GHS',
    metadata: json.data?.metadata ?? {},
  };
}
