'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Award, Users, Building2 } from 'lucide-react';

function CountUp({ to, suffix = '+' }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export function MissionStrip() {
  const t = useTranslations('home.mission');
  const stats = useTranslations('stats');

  const items = [
    { icon: Award, value: Number(stats('years')), label: t('yearsLabel') },
    { icon: Users, value: Number(stats('choristers')), label: t('choristersLabel') },
    { icon: Building2, value: Number(stats('churches')), label: t('churchesLabel') },
  ];

  return (
    <section className="relative -mt-12 md:-mt-20 z-10">
      <div className="container">
        <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-elevated backdrop-blur-md md:grid-cols-3 md:p-8">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-center gap-4 rounded-xl px-2 py-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow/40">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-foreground">
                  <CountUp to={s.value} />
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
