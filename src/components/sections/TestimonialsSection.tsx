'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

type Testimonial = { quote: string; name: string; role: string };

export function TestimonialsSection() {
  const t = useTranslations('home.testimonials');
  const messages = useTranslations();
  const list = messages.raw('testimonials') as Testimonial[];

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 6500);
    return () => clearInterval(id);
  }, [list.length]);

  const go = (delta: number) =>
    setIndex((i) => (i + delta + list.length) % list.length);
  const current = list[index];

  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container">
        <SectionHeader eyebrow={t('eyebrow')} title={t('title')} />

        <div className="relative mx-auto mt-12 max-w-3xl">
          <Quote
            aria-hidden
            className="absolute -left-2 -top-6 h-16 w-16 text-gold/20 md:-left-6 md:h-20 md:w-20"
          />

          <div className="relative min-h-[220px] rounded-3xl border border-border/60 bg-card p-8 shadow-soft md:p-12">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                className="text-center"
              >
                <p className="font-serif text-lg italic leading-relaxed text-foreground md:text-2xl">
                  “{current.quote}”
                </p>
                <footer className="mt-6">
                  <div className="font-semibold">{current.name}</div>
                  <div className="text-sm text-muted-foreground">{current.role}</div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
