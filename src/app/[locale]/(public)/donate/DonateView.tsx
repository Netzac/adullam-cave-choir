'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { PaystackButton } from '@/components/payments/PaystackButton';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Heart, Sparkles, Church, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHero } from '@/components/sections/PageHero';
import { donationSchema, type DonationInput } from '@/lib/validations/donationSchema';
import { cn } from '@/lib/utils';

const tierKeys = ['chorister', 'church', 'general'] as const;
const tierIcons = { chorister: HeartHandshake, church: Church, general: Sparkles } as const;

export function DonateView() {
  const locale = useLocale();
  const hero = useTranslations('donate.hero');
  const nav = useTranslations('nav');
  const impact = useTranslations('donate.impact');
  const tiers = useTranslations('donate.tiers');
  const f = useTranslations('donate.form');

  const params = useSearchParams();
  const initialAmount = Number(params.get('amount')) || 250;

  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [paymentRef, setPaymentRef] = React.useState<string | null>(null);
  const [authUrl, setAuthUrl] = React.useState<string | null>(null);

  const rhf = useForm<DonationInput>({
    resolver: zodResolver(donationSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      donor_name: '',
      email: '',
      phone: '',
      amount: initialAmount,
      currency: 'GHS',
      message: '',
    },
  });

  const amount = rhf.watch('amount');

  const setTier = (k: (typeof tierKeys)[number]) => {
    const val = Number(tiers(`${k}.amount` as 'chorister.amount'));
    rhf.setValue('amount', val, { shouldValidate: true });
  };

  const onSubmit = async (data: DonationInput) => {
    if (!data.email) {
      rhf.setError('email', { message: f('emailRequired') });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        reference?: string;
        authorizationUrl?: string;
        configured?: boolean;
      };
      if (!res.ok || !json.ok || !json.reference) throw new Error('Failed');
      setPaymentRef(json.reference);
      setAuthUrl(json.authorizationUrl ?? null);
      if (!json.configured) {
        setDone(true);
        toast.success(f('success'));
      }
    } catch {
      toast.error(f('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        variant="dark"
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('donate') },
        ]}
      />

      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {impact('title')}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">{impact('body')}</p>
        </div>

        <div className="mt-12">
          <h3 className="text-center font-serif text-2xl font-bold md:text-3xl">
            {tiers('title')}
          </h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {tierKeys.map((k, i) => {
              const Icon = tierIcons[k];
              const tierAmount = Number(tiers(`${k}.amount` as 'chorister.amount'));
              const isActive = amount === tierAmount;
              return (
                <motion.button
                  key={k}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setTier(k)}
                  className={cn(
                    'group rounded-2xl border bg-card p-6 text-left shadow-soft transition-all hover:shadow-elevated',
                    isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border/60',
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-gold text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-5 font-serif text-xl font-bold">
                    {tiers(`${k}.title` as 'chorister.title')}
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tiers(`${k}.body` as 'chorister.body')}
                  </p>
                  <p className="mt-4 font-serif text-2xl font-bold text-primary">
                    ₵{tierAmount.toLocaleString()}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-14 max-w-2xl rounded-3xl border border-border/60 bg-card p-8 shadow-elevated md:p-10"
        >
          {done ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-gold text-white">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-serif text-2xl font-bold">{f('success')}</h3>
              <p className="mt-2 text-muted-foreground">{f('thankYou')}</p>
            </div>
          ) : paymentRef ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{f('payPrompt')}</p>
              <PaystackButton
                email={rhf.getValues('email') ?? ''}
                amount={amount}
                reference={paymentRef}
                authorizationUrl={authUrl}
                label={f('payNow')}
                loadingLabel={f('submitting')}
                onSuccess={() => {
                  setDone(true);
                  toast.success(f('success'));
                }}
                onError={(msg) => toast.error(msg)}
              />
              <Button type="button" variant="ghost" onClick={() => setPaymentRef(null)}>
                {f('editDetails')}
              </Button>
            </div>
          ) : (
            <form onSubmit={rhf.handleSubmit(onSubmit)} className="space-y-5">
              <Field error={rhf.formState.errors.amount?.message}>
                <Label htmlFor="amount">{f('amount')}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₵
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step="1"
                    className="pl-7 text-lg font-semibold"
                    {...rhf.register('amount', { valueAsNumber: true })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{f('customAmount')}</p>
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field error={rhf.formState.errors.donor_name?.message}>
                  <Label htmlFor="donor_name">{f('donorName')}</Label>
                  <Input id="donor_name" autoComplete="name" {...rhf.register('donor_name')} />
                </Field>
                <Field error={rhf.formState.errors.email?.message}>
                  <Label htmlFor="email">{f('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...rhf.register('email')}
                  />
                </Field>
              </div>

              <Field error={rhf.formState.errors.phone?.message}>
                <Label htmlFor="phone">{f('phone')}</Label>
                <Input id="phone" type="tel" autoComplete="tel" {...rhf.register('phone')} />
              </Field>

              <Field error={rhf.formState.errors.message?.message}>
                <Label htmlFor="message">{f('message')}</Label>
                <Textarea id="message" rows={3} {...rhf.register('message')} />
              </Field>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-gold text-dark shadow-glow-gold/40 hover:bg-gold-700 hover:text-white"
              >
                {submitting ? f('submitting') : f('submit')}
                <Heart className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </motion.div>
      </section>
    </>
  );
}

function Field({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
