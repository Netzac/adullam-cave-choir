'use client';

import { motion } from 'framer-motion';
import { useTranslations, useFormatter } from 'next-intl';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHero } from '@/components/sections/PageHero';
import type { ChoirEvent } from '@/types/database';

export function EventsView({
  upcoming,
  past,
}: {
  upcoming: ChoirEvent[];
  past: ChoirEvent[];
}) {
  const hero = useTranslations('events.hero');
  const nav = useTranslations('nav');
  const card = useTranslations('events.card');
  const cta = useTranslations('cta');
  const req = useTranslations('events.requestCta');
  const pastT = useTranslations('events.past');
  const t = useTranslations('events');
  const format = useFormatter();

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('events') },
        ]}
      />

      <section className="container py-16 md:py-20">
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((evt, i) => {
              const d = new Date(`${evt.date}T${evt.time}`);
              return (
                <motion.article
                  key={evt.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-elevated"
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
                          {evt.fee > 0 ? `GHS ${evt.fee}` : card('free')}
                        </Badge>
                      </div>
                      <h3 className="mt-2 font-serif text-lg font-bold leading-snug">
                        {evt.title}
                      </h3>
                    </div>
                  </div>
                  <p className="px-6 pb-2 text-sm text-muted-foreground">{evt.description}</p>
                  <dl className="space-y-2 border-t border-border/60 px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary/70" />
                      {format.dateTime(d, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary/70" />
                      {format.dateTime(d, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary/70" />
                      {evt.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary/70" />
                      {card('capacity')}: {evt.capacity}
                    </div>
                  </dl>
                  <div className="mt-auto border-t border-border/60 p-4">
                    <Button asChild className="w-full group">
                      <Link href="/apply">
                        {cta('applyWorkshop')}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <section className="container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-dark p-10 text-white shadow-elevated md:p-14"
        >
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <Sparkles className="h-8 w-8 text-gold-300" />
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight md:text-4xl">
                {req('title')}
              </h2>
              <p className="mt-3 text-white/80">{req('body')}</p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gold text-dark shadow-glow-gold/40 hover:bg-gold-700 hover:text-white"
            >
              <Link href="/contact?subject=workshop">{req('cta')}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container max-w-3xl">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {pastT('title')}
          </h2>
          <p className="mt-2 text-center text-muted-foreground">{pastT('subtitle')}</p>

          <Accordion type="single" collapsible className="mt-10 w-full">
            {past.map((evt) => {
              const d = new Date(`${evt.date}T${evt.time}`);
              return (
                <AccordionItem key={evt.id} value={evt.id}>
                  <AccordionTrigger className="text-left">
                    <span className="font-serif text-lg">{evt.title}</span>
                    <span className="ml-auto mr-2 text-xs text-muted-foreground">
                      {format.dateTime(d, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{evt.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <MapPin className="mr-1 inline h-3 w-3" /> {evt.venue}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>
    </>
  );
}
