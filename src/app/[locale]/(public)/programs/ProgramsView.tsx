'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Clock, Users, MapPin, BookOpen } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { Program } from '@/types/database';

type FilterKey = 'all' | 'choristers' | 'worship' | 'instruments';

const matchFilter = (p: Program, key: FilterKey) => {
  if (key === 'all') return true;
  const title = p.title.toLowerCase();
  if (key === 'choristers') return p.target_audience === 'youth' || title.includes('chorister');
  if (key === 'worship') return title.includes('worship');
  if (key === 'instruments')
    return ['piano', 'organ', 'keyboard', 'instrument'].some((k) => title.includes(k));
  return true;
};

export function ProgramsView({ programs }: { programs: Program[] }) {
  const hero = useTranslations('programsPage.hero');
  const nav = useTranslations('nav');
  const filters = useTranslations('programsPage.filters');
  const card = useTranslations('programsPage.card');
  const faq = useTranslations('programsPage.faq');
  const cta = useTranslations('cta');
  const common = useTranslations('common');

  const [filter, setFilter] = React.useState<FilterKey>('all');

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: filters('all') },
    { key: 'choristers', label: filters('choristers') },
    { key: 'worship', label: filters('worship') },
    { key: 'instruments', label: filters('instruments') },
  ];

  const visible = programs.filter((p) => matchFilter(p, filter));

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('programs') },
        ]}
      />

      <section className="container py-16 md:py-20">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                filter === t.key
                  ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
            {common('empty')}
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl font-bold leading-snug">{p.title}</h3>
                  <Badge variant={p.is_active ? 'gold' : 'outline'}>
                    {p.is_active ? 'Active' : 'Closed'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>

                <dl className="mt-5 grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-primary/70" />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                        {card('audience')}
                      </dt>
                      <dd className="font-medium capitalize">{p.target_audience}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-primary/70" />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                        {card('duration')}
                      </dt>
                      <dd className="font-medium">{p.duration}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary/70" />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                        {card('format')}
                      </dt>
                      <dd className="font-medium capitalize">{p.format.replace('_', ' ')}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 text-primary/70" />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                        {card('prerequisites')}
                      </dt>
                      <dd className="text-sm text-muted-foreground">{p.prerequisites}</dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-auto pt-6">
                  <Button asChild className="w-full group">
                    <Link href="/apply">
                      {cta('applyProgram')}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container max-w-3xl">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {faq('title')}
          </h2>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {[1, 2, 3, 4].map((n) => (
              <AccordionItem key={n} value={`item-${n}`}>
                <AccordionTrigger className="text-left font-serif text-lg">
                  {faq(`items.q${n}` as 'items.q1')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq(`items.a${n}` as 'items.a1')}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
