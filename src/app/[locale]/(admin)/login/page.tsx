'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/loginSchema';

export default function AdminLoginPage() {
  const t = useTranslations('adminAuth.login');
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const rhf = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError(t('invalid'));
        return;
      }

      router.replace('/admin/dashboard');
      router.refresh();
    } catch {
      setServerError(t('unexpected'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-purple-950 via-[#0F0A1E] to-purple-900 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(217,119,6,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(107,33,168,0.4), transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="dark" />
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-gold-300/80">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-white/70">{t('subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-md md:p-8">
          <form onSubmit={rhf.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/90">
                {t('emailLabel')}
              </Label>
              <div className="relative">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={t('emailPlaceholder')}
                  className="border-white/15 bg-white/[0.06] pl-9 text-white placeholder:text-white/40 focus-visible:ring-gold-400"
                  aria-invalid={!!rhf.formState.errors.email}
                  {...rhf.register('email')}
                />
              </div>
              {rhf.formState.errors.email ? (
                <p className="text-xs text-rose-300">
                  {rhf.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/90">
                {t('passwordLabel')}
              </Label>
              <div className="relative">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('passwordPlaceholder')}
                  className="border-white/15 bg-white/[0.06] pl-9 text-white placeholder:text-white/40 focus-visible:ring-gold-400"
                  aria-invalid={!!rhf.formState.errors.password}
                  {...rhf.register('password')}
                />
              </div>
              {rhf.formState.errors.password ? (
                <p className="text-xs text-rose-300">
                  {rhf.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div
                role="alert"
                className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
              >
                {serverError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-purple-950 hover:from-gold-400 hover:to-gold-500"
            >
              {submitting ? t('submitting') : t('submit')}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/55">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-300" />
            <span>{t('footnote')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
