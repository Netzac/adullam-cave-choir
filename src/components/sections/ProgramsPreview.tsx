'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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
    image: '/images/programs/young-choristers.jpg',
    alt: 'Young choristers singing',
  },
  {
    icon: Mic2,
    titleKey: 'programs.worship',
    body: 'Leading congregations with skill, sensitivity, and Spirit-led presence.',
    href: '/programs#worship',
    gradient: 'from-gold to-gold-700',
    image: '/images/programs/worship-leadership.jpg',
    alt: 'Worship leader on stage',
  },
  {
    icon: Piano,
    titleKey: 'programs.instruments',
    body: 'Piano, organ, keyboards — technique, theory, and ministry application.',
    href: '/programs#instruments',
    gradient: 'from-crimson to-purple-700',
    image: '/images/programs/instrument-training.jpg',
    alt: 'Piano keyboard during training',
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
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-elevated"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-30 mix-blend-multiply`}
                />
              </div>
              <div className="relative p-7">
                <div
                  className={`relative -mt-12 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-glow/30`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center text-sm font-medium text-primary"
                >
                  {t('cta.learnMore')}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
