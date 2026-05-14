'use client';

import { motion } from 'framer-motion';
import { useTranslations, useFormatter } from 'next-intl';
import {
  Wrench,
  Settings2,
  GraduationCap,
  Headphones,
  Piano,
  Music2,
  Speaker,
  Radio,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/sections/PageHero';
import type { EquipmentRecord } from '@/types/database';

const serviceIcons = [Wrench, Settings2, GraduationCap, Headphones];
const serviceKeys = ['install', 'config', 'training', 'support'] as const;

const typeIcons = {
  piano: Piano,
  organ: Music2,
  keyboards: Music2,
  sound: Speaker,
} as const;
const typeKeys = ['piano', 'organ', 'keyboards', 'sound'] as const;

export function EquipmentClient({ cases }: { cases: EquipmentRecord[] }) {
  const hero = useTranslations('equipmentPage.hero');
  const nav = useTranslations('nav');
  const services = useTranslations('equipmentPage.services');
  const types = useTranslations('equipmentPage.types');
  const casesT = useTranslations('equipmentPage.cases');
  const ctaSec = useTranslations('equipmentPage.cta');
  const cta = useTranslations('cta');
  const format = useFormatter();

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        variant="dark"
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('equipment') },
        ]}
      />

      <section className="container py-20 md:py-28">
        <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {services('title')}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {serviceKeys.map((k, i) => {
            const Icon = serviceIcons[i];
            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-serif text-lg font-bold">
                  {services(`${k}.title` as 'install.title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {services(`${k}.body` as 'install.body')}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {types('title')}
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {typeKeys.map((k, i) => {
              const Icon = typeIcons[k];
              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="group rounded-2xl border border-border/60 bg-card p-6 text-center shadow-soft transition-shadow hover:shadow-elevated"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-600 to-gold text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold">{types(k)}</h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-28">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {casesT('title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{casesT('subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
            >
              <div className="flex items-center gap-2">
                <Badge variant="gold" className="capitalize">
                  {c.status}
                </Badge>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold leading-snug">{c.church_name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.equipment_types.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.notes}</p>
              <dl className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  {c.location}
                </div>
                {c.service_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    {format.dateTime(new Date(c.service_date), {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </div>
                ) : null}
              </dl>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="container pb-20 md:pb-28">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-dark p-10 text-center text-white shadow-elevated md:p-16">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">
            {ctaSec('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">{ctaSec('body')}</p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-gold text-dark shadow-glow-gold/40 hover:bg-gold-700 hover:text-white"
          >
            <Link href="/contact?subject=equipment">{cta('requestService')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
