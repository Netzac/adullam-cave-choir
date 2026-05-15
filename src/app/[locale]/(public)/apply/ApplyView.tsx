'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PageHero } from '@/components/sections/PageHero';
import { z } from 'zod';
import { applicationSchema, type ApplicationInput } from '@/lib/validations/applicationSchema';

type ApplicationFormInput = z.input<typeof applicationSchema>;
import { placeholderPrograms } from '@/lib/constants/placeholders';
import { cn } from '@/lib/utils';

type Step = 0 | 1 | 2;

const stepFields: Record<Step, (keyof ApplicationInput)[]> = {
  0: ['full_name', 'age', 'phone', 'email', 'passport_photo_url'],
  1: ['interest_level', 'preferred_program', 'experience'],
  2: ['guardian_consent', 'notes'],
};

export function ApplyView() {
  const locale = useLocale();
  const hero = useTranslations('apply.hero');
  const nav = useTranslations('nav');
  const steps = useTranslations('apply.steps');
  const fields = useTranslations('apply.fields');
  const levels = useTranslations('apply.levels');
  const review = useTranslations('apply.review');
  const errors = useTranslations('apply.errors');
  const success = useTranslations('apply.success');
  const common = useTranslations('common');
  const apply = useTranslations('apply');

  const [step, setStep] = React.useState<Step>(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const form = useForm<ApplicationFormInput, unknown, ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      age: undefined as unknown as number,
      phone: '',
      email: '',
      interest_level: 'beginner',
      preferred_program: '',
      experience: '',
      guardian_consent: false,
      notes: '',
      passport_photo_url: '',
    },
  });

  const values = form.watch();
  const isMinor = typeof values.age === 'number' && values.age < 18;

  const next = async () => {
    const valid = await form.trigger(stepFields[step]);
    if (!valid) return;
    if (step < 2) setStep((s) => ((s + 1) as Step));
  };
  const back = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const onSubmit = async (data: ApplicationInput) => {
    if (isMinor && !data.guardian_consent) {
      form.setError('guardian_consent', { message: 'Guardian consent is required for under 18.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error('Failed');
      setDone(true);
    } catch {
      toast.error(errors('submit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <PageHero
          eyebrow={hero('eyebrow')}
          title={hero('title')}
          subtitle={hero('subtitle')}
          breadcrumb={[{ label: nav('home'), href: '/' }, { label: 'Apply' }]}
        />
        <section className="container py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-card p-10 text-center shadow-elevated md:p-14"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-gold text-white">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight md:text-4xl">
              {success('title')}
            </h2>
            <p className="mt-3 text-muted-foreground">{success('body')}</p>
            <Button asChild className="mt-8">
              <Link href="/">{success('cta')}</Link>
            </Button>
          </motion.div>
        </section>
      </>
    );
  }

  const stepLabels = [steps('personal'), steps('interest'), steps('consent')];

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        breadcrumb={[{ label: nav('home'), href: '/' }, { label: 'Apply' }]}
      />

      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>
              {common('step')} {step + 1} {common('of')} 3
            </span>
            <span className="font-semibold text-foreground">{stepLabels[step]}</span>
          </div>
          <Progress value={((step + 1) / 3) * 100} className="h-2" />

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            {stepLabels.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => i < step && setStep(i as Step)}
                className={cn(
                  'rounded-lg border px-2 py-2 transition-colors',
                  i === step
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : i < step
                      ? 'border-border bg-card text-muted-foreground hover:bg-accent'
                      : 'border-border bg-card/60 text-muted-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-soft md:p-10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {step === 0 ? (
                  <>
                    <FieldRow>
                      <Field error={form.formState.errors.full_name?.message}>
                        <Label htmlFor="full_name">{fields('fullName')}</Label>
                        <Input id="full_name" autoComplete="name" {...form.register('full_name')} />
                      </Field>
                      <Field error={form.formState.errors.age?.message}>
                        <Label htmlFor="age">{fields('age')}</Label>
                        <Input
                          id="age"
                          type="number"
                          inputMode="numeric"
                          min={5}
                          {...form.register('age', { valueAsNumber: true })}
                        />
                      </Field>
                    </FieldRow>
                    <FieldRow>
                      <Field error={form.formState.errors.phone?.message}>
                        <Label htmlFor="phone">{fields('phone')}</Label>
                        <Input id="phone" type="tel" autoComplete="tel" {...form.register('phone')} />
                      </Field>
                      <Field error={form.formState.errors.email?.message}>
                        <Label htmlFor="email">
                          {fields('email')}{' '}
                          <span className="text-xs text-muted-foreground">
                            ({common('optional')})
                          </span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          {...form.register('email')}
                        />
                      </Field>
                    </FieldRow>
                    <Field error={form.formState.errors.passport_photo_url?.message}>
                      <Label htmlFor="passport_photo_url">
                        {fields('passportPhoto')}{' '}
                        <span className="text-xs text-muted-foreground">
                          ({common('optional')})
                        </span>
                      </Label>
                      <Input
                        id="passport_photo_url"
                        type="url"
                        placeholder="https://…"
                        {...form.register('passport_photo_url')}
                      />
                    </Field>
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <Field error={form.formState.errors.interest_level?.message}>
                      <Label>{fields('interestLevel')}</Label>
                      <Select
                        value={values.interest_level}
                        onValueChange={(v) =>
                          form.setValue('interest_level', v as ApplicationInput['interest_level'], {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">{levels('beginner')}</SelectItem>
                          <SelectItem value="intermediate">{levels('intermediate')}</SelectItem>
                          <SelectItem value="advanced">{levels('advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field error={form.formState.errors.preferred_program?.message}>
                      <Label>{fields('preferredProgram')}</Label>
                      <Select
                        value={values.preferred_program}
                        onValueChange={(v) =>
                          form.setValue('preferred_program', v, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {placeholderPrograms.map((p) => (
                            <SelectItem key={p.id} value={p.title}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field error={form.formState.errors.experience?.message}>
                      <Label htmlFor="experience">{fields('experience')}</Label>
                      <Textarea
                        id="experience"
                        rows={5}
                        placeholder="Briefly share your background, training, or church involvement."
                        {...form.register('experience')}
                      />
                    </Field>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                      <h3 className="font-serif text-lg font-bold">{review('title')}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{review('subtitle')}</p>
                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                        <ReviewItem label={fields('fullName')} value={values.full_name} />
                        <ReviewItem label={fields('age')} value={String(values.age ?? '')} />
                        <ReviewItem label={fields('phone')} value={values.phone} />
                        <ReviewItem label={fields('email')} value={values.email || '—'} />
                        <ReviewItem
                          label={fields('interestLevel')}
                          value={levels(values.interest_level ?? '')}
                        />
                        <ReviewItem
                          label={fields('preferredProgram')}
                          value={values.preferred_program || '—'}
                        />
                      </dl>
                    </div>

                    {isMinor ? (
                      <Field error={form.formState.errors.guardian_consent?.message}>
                        <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-border accent-primary"
                            {...form.register('guardian_consent')}
                          />
                          <span className="text-sm leading-relaxed">
                            {fields('guardianConsent')}
                          </span>
                        </label>
                      </Field>
                    ) : null}

                    <Field error={form.formState.errors.notes?.message}>
                      <Label htmlFor="notes">{fields('notes')}</Label>
                      <Textarea id="notes" rows={4} {...form.register('notes')} />
                    </Field>
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                disabled={step === 0}
                className="group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {common('back')}
              </Button>
              {step < 2 ? (
                <Button type="button" onClick={next} className="group">
                  {common('continue')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting} className="group">
                  {submitting ? apply('submitting') : apply('submit')}
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

function Field({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}
