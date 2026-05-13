'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function AboutPreview() {
  const t = useTranslations('home.about');
  const cta = useTranslations('cta');

  return (
    <section className="container py-20 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-400">
            <span className="mr-3 inline-block h-px w-8 bg-gold-600/70" aria-hidden />
            {t('eyebrow')}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('p1')}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('p2')}
          </p>
          <Button asChild className="mt-8 group">
            <Link href="/about">
              {cta('learnMore')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-purple-900 via-purple-800 to-dark shadow-elevated">
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 30% 30%, rgba(217,119,6,0.5), transparent 50%)',
                }}
              />
              <Sparkles className="h-24 w-24 text-gold-400/70" />
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-3xl bg-gold/20 blur-2xl md:block"
          />
        </motion.div>
      </div>
    </section>
  );
}
