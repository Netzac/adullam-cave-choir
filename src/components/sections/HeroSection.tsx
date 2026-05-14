'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Music2, ChevronDown, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PARTICLE_COUNT = 30;

function useParticles() {
  return React.useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 10 + Math.random() * 8,
        size: 30 + Math.random() * 20,
        opacity: 0.45 + Math.random() * 0.18,
      })),
    []
  );
}

export function HeroSection() {
  const t = useTranslations('home.hero');
  const cta = useTranslations('cta');
  const particles = useParticles();

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-dark text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-dark via-purple-950 to-purple-900"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(217,119,6,0.35), transparent 40%), radial-gradient(circle at 80% 30%, rgba(107,33,168,0.45), transparent 45%)',
        }}
      />

      <ul aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {particles.map((p) => (
          <motion.li
            key={p.id}
            className="absolute text-gold-300"
            style={{ left: `${p.left}%`, top: '110%', opacity: p.opacity, fontSize: p.size }}
            animate={{ y: ['0vh', '-120vh'], opacity: [p.opacity, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          >
            <Music2 className="h-[1em] w-[1em]" />
          </motion.li>
        ))}
      </ul>

      <div className="container relative flex flex-col items-center text-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="border-gold-500/60 bg-white/5 text-gold-300 backdrop-blur px-4 py-1.5 text-[11px] uppercase tracking-[0.24em]"
          >
            {t('eyebrow')}
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-tight text-balance md:text-7xl lg:text-[5.5rem]"
        >
          <span className="bg-gradient-to-br from-white via-white to-gold-300 bg-clip-text text-transparent">
            {t('headline')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/75 md:text-lg"
        >
          {t('subheadline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="bg-gold hover:bg-gold-600 text-white shadow-glow-gold/60"
          >
            <Link href="/apply">{cta('applyNow')}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/5 text-white hover:bg-white/10 backdrop-blur"
          >
            <Link href="/about">
              <PlayCircle className="mr-2 h-4 w-4" />
              {cta('watchStory')}
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        >
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em]"
          >
            {t('scrollHint')}
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
