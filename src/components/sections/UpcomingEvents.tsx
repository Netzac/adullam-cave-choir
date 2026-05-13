'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight, Globe } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';
import type { ChoirEvent } from '@/types/database';

export function UpcomingEvents({ events }: { events: ChoirEvent[] }) {
  const t = useTranslations('home.events');
  const cta = useTranslations('cta');
  const cardT = useTranslations('events.card');
  const format = useFormatter();

  return (
    <section className="container py-20 md:py-28">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          align="left"
          className="mx-0"
        />
        <Button asChild variant="ghost" className="self-end">
          <Link href="/events">
            {cta('viewAll')}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((evt, i) => {
            const d = new Date(`${evt.date}T${evt.time}`);
            return (
              <motion.article
                key={evt.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-elevated"
              >
                <div className="flex items-start gap-4 p-6">
                  <div className="flex flex-col items-center rounded-xl bg-gradient-brand px-3 py-2 text-white">
                    <span className="text-[10px] uppercase tracking-widest opacity-80">
                      {format.dateTime(d, { month: 'short' })}
                    </span>
                    <span className="font-serif text-2xl font-bold leading-none">
                      {format.dateTime(d, { day: '2-digit' })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {evt.is_online ? (
                        <Badge variant="outline" className="border-primary/40 text-primary">
                          <Globe className="mr-1 h-3 w-3" /> Online
                        </Badge>
                      ) : null}
                      <Badge variant="gold">
                        {evt.fee > 0 ? `GHS ${evt.fee}` : cardT('free')}
                      </Badge>
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-bold leading-snug">
                      {evt.title}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 border-t border-border/60 px-6 py-4 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary/70" />
                    {format.dateTime(d, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    {evt.venue}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    {format.dateTime(d, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <Link
                  href="/events"
                  className="block border-t border-border/60 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent/40"
                >
                  {cta('applyWorkshop')} →
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
