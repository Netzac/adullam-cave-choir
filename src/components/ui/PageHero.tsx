'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  variant?: 'default' | 'dark';
  align?: 'center' | 'left';
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  variant = 'default',
  align = 'center',
}: PageHeroProps) {
  const isDark = variant === 'dark';
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        isDark ? 'bg-dark text-white' : 'bg-muted/30',
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 20% 20%, rgba(107,33,168,0.35), transparent 50%), radial-gradient(circle at 80% 80%, rgba(217,119,6,0.25), transparent 55%)'
            : 'radial-gradient(circle at 80% 0%, rgba(107,33,168,0.10), transparent 50%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      <motion.div
        className={cn(
          'container relative py-20 md:py-28',
          align === 'center' ? 'text-center' : 'text-left',
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              'mb-4 flex items-center gap-1 text-xs',
              align === 'center' ? 'justify-center' : 'justify-start',
              isDark ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            {breadcrumb.map((b, i) => (
              <span key={`${b.label}-${i}`} className="inline-flex items-center gap-1">
                {b.href ? (
                  <Link href={b.href} className="hover:underline">
                    {b.label}
                  </Link>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumb.length - 1 ? (
                  <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                ) : null}
              </span>
            ))}
          </nav>
        ) : null}

        {eyebrow ? (
          <span
            className={cn(
              'inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.22em]',
              isDark ? 'text-gold-300' : 'text-gold-600 dark:text-gold-400',
              align === 'center' ? 'justify-center' : '',
            )}
          >
            <span
              aria-hidden
              className={cn('mr-3 inline-block h-px w-8', isDark ? 'bg-gold-400/70' : 'bg-gold-600/70')}
            />
            {eyebrow}
          </span>
        ) : null}

        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-balance md:text-6xl">
          {title}
        </h1>

        {subtitle ? (
          <p
            className={cn(
              'mx-auto mt-5 max-w-2xl text-base leading-relaxed text-balance md:text-lg',
              align === 'left' ? 'mx-0' : '',
              isDark ? 'text-white/75' : 'text-muted-foreground',
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </motion.div>
    </section>
  );
}
