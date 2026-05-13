'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const presets = [50, 100, 250, 500, 1000];

export function DonationCTA() {
  const t = useTranslations('home.donate');
  const [amount, setAmount] = React.useState<number>(250);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-dark"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(217,119,6,0.4), transparent 50%), radial-gradient(circle at 85% 80%, rgba(139,26,26,0.35), transparent 55%)',
        }}
      />

      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center text-white">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-300"
          >
            <span className="mr-3 inline-block h-px w-8 bg-gold-400/70" aria-hidden />
            {t('eyebrow')}
            <span className="ml-3 inline-block h-px w-8 bg-gold-400/70" aria-hidden />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-4 font-serif text-4xl font-bold tracking-tight md:text-5xl"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-4 text-base leading-relaxed text-white/80 md:text-lg"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md md:p-8"
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-sm font-semibold transition-all',
                    amount === p
                      ? 'border-gold bg-gold text-dark shadow-glow-gold/50'
                      : 'border-white/20 bg-white/[0.04] text-white hover:border-gold/40 hover:bg-white/[0.08]',
                  )}
                >
                  ₵{p}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gold text-dark shadow-glow-gold/40 hover:bg-gold-700 hover:text-white"
              >
                <Link href={`/donate?amount=${amount}`}>
                  <Heart className="mr-2 h-4 w-4" />
                  {t('subtitle').length > 0 ? `Give ₵${amount}` : 'Give'}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/donate">
                  Choose another amount
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
