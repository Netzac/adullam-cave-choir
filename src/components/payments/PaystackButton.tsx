'use client';

import * as React from 'react';
import PaystackPop from '@paystack/inline-js';
import { Button } from '@/components/ui/button';

interface PaystackButtonProps {
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  authorizationUrl?: string | null;
  label: string;
  loadingLabel: string;
  disabled?: boolean;
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export function PaystackButton({
  email,
  amount,
  currency = 'GHS',
  reference,
  authorizationUrl,
  label,
  loadingLabel,
  disabled,
  onSuccess,
  onError,
}: PaystackButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const handlePay = () => {
    if (!publicKey) {
      onError?.('Paystack is not configured');
      return;
    }

    setLoading(true);
    try {
      const popup = new PaystackPop();
      popup.newTransaction({
        key: publicKey,
        email,
        amount: Math.round(amount * 100),
        currency,
        ref: reference,
        onSuccess: () => {
          setLoading(false);
          onSuccess();
        },
        onCancel: () => {
          setLoading(false);
        },
        onError: (err: { message?: string }) => {
          setLoading(false);
          onError?.(err.message ?? 'Payment failed');
        },
      });
    } catch {
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
        return;
      }
      setLoading(false);
      onError?.('Could not open payment');
    }
  };

  return (
    <Button
      type="button"
      onClick={handlePay}
      disabled={disabled || loading || !email}
      className="w-full bg-gold hover:bg-gold-600 text-purple-950"
    >
      {loading ? loadingLabel : label}
    </Button>
  );
}
