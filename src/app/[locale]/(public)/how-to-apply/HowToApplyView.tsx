'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ClipboardList, Search, Mic, PartyPopper, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHero } from '@/components/sections/PageHero';

const stepIcons = [ClipboardList, Search, Mic, PartyPopper];

export function HowToApplyView() {
  const hero = useTranslations('howToApply.hero');
  const nav = useTranslations('nav');
  const steps = useTranslations('howToApply.steps');
  const eligibility = useTranslations('howToApply.eligibility');
  const faq = useTranslations('howToApply.faq');
  const t = useTranslations('howToApply');

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('howToApply') },
        ]}
      />

      <section className="container py-20 md:py-28">
        <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {steps('title')}
        </h2>

        <ol className="relative mx-auto mt-12 max-w-2xl">
          <div
            aria-hidden
            className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-purple-600/60 via-gold/50 to-purple-600/30"
          />
          {([1, 2, 3, 4] as const).map((n, i) => {
            const Icon = stepIcons[i];
            return (
              <motion.li
                key={n}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex gap-5 pb-10 last:pb-0"
              >
                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-soft">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="pt-1">
                  <h3 className="font-serif text-lg font-bold">
                    {steps(`s${n}Title` as 's1Title')}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    {steps(`s${n}Body` as 's1Body')}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container max-w-3xl">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {eligibility('title')}
          </h2>
          <ul className="mt-10 space-y-3">
            {([1, 2, 3, 4] as const).map((n, i) => (
              <motion.li
                key={n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-600 to-gold text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm md:text-base">
                  {eligibility(`items.i${n}` as 'items.i1')}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-4xl">
            {faq('title')}
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {([1, 2, 3] as const).map((n) => (
              <AccordionItem key={n} value={`q${n}`}>
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

      <section className="container pb-20 md:pb-28">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-dark p-10 text-center text-white shadow-elevated md:p-14">
          <Button
            asChild
            size="lg"
            className="bg-gold text-dark shadow-glow-gold/40 hover:bg-gold-700 hover:text-white"
          >
            <Link href="/apply">{t('cta')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
