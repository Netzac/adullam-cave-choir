'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Speaker, Piano, Mic, Radio } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';

const services = [
  { icon: Speaker, key: 'sound' },
  { icon: Piano, key: 'piano' },
  { icon: Mic, key: 'mic' },
  { icon: Radio, key: 'radio' },
];

const labels: Record<string, string> = {
  sound: 'Sound Systems',
  piano: 'Piano & Organs',
  mic: 'Mics & Monitors',
  radio: 'Live Streaming',
};

const showcase: { src: string; title: string; caption: string }[] = [
  {
    src: '/images/equipment/sound-system.jpg',
    title: 'Sound Systems',
    caption: 'Sanctuary-grade PA installs',
  },
  {
    src: '/images/equipment/piano.jpg',
    title: 'Piano & Keys',
    caption: 'Stage keyboards and grand pianos',
  },
  {
    src: '/images/equipment/installation.jpg',
    title: 'On-site Installation',
    caption: 'Configuration and team training',
  },
];

export function EquipmentPreview() {
  const t = useTranslations('home.equipment');
  const cta = useTranslations('cta');

  return (
    <section className="relative overflow-hidden bg-dark py-20 text-white md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(107,33,168,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(217,119,6,0.25), transparent 55%)',
        }}
      />
      <div className="container relative">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          invert
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {showcase.map((item, i) => (
            <motion.figure
              key={item.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative h-72 overflow-hidden rounded-2xl border border-white/10"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-serif text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-white/75">{item.caption}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-600 to-gold text-white shadow-glow-gold/40">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-lg font-bold">{labels[s.key]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Professional install, configuration, and team training.
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/equipment">
              {cta('requestService')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
