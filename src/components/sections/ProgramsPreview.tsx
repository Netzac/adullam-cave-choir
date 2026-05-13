'use client';

import { motion } from 'framer-motion';
import { Music, Mic2, Piano, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SectionHeader } from './SectionHeader';

const items = [
  {
    icon: Music,
    titleKey: 'programs.choristers',
    body: 'Vocal foundations, sight-singing, and worship formation for young singers.',
    href: '/programs#choristers',
    gradient: 'from-purple-600 to-purple-800',
  },
  {
    icon: Mic2,
    titleKey: 'programs.worship',
    body: 'Leading congregations with skill, sensitivity, and Spirit-led presence.',
    href: '/programs#worship',
    gradient: 'from-gold to-gold-700',
  },
  {
    icon: Piano,
    titleKey: 'programs.instruments',
    body: 'Piano, organ, keyboards — technique, theory, and ministry application.',
    href: '/programs#instruments',
    gradient: 'from-crimson to-purple-700',
  },
];

export function ProgramsPreview() {
  const t = useTranslations();
  const ph = useTranslations('home.programs');

  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container">
        <SectionHeader
          eyebrow={ph('eyebrow')}
          title={ph('title')}
          subtitle={ph('subtitle')}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.article
              key={item.titleKey}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 shadow-soft transition-shadow hover:shadow-elevated"
            >
              <div
                aria-hidden
                className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${item.gradient} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
              />
              <div
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-glow/30`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold">{t(item.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              <Link
                href={item.href}
                className="mt-5 inline-flex items-center text-sm font-medium text-primary"
              >
                {t('cta.learnMore')}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
