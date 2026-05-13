'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  invert?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  invert = false,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mx-auto max-w-2xl',
        align === 'center' ? 'text-center' : 'text-left mx-0',
        className
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.22em]',
            invert ? 'text-gold-400' : 'text-gold-600 dark:text-gold-400'
          )}
        >
          <span
            className={cn(
              'mr-3 inline-block h-px w-8',
              invert ? 'bg-gold-400/70' : 'bg-gold-600/70'
            )}
            aria-hidden
          />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          'mt-3 font-serif text-3xl font-bold tracking-tight text-balance md:text-5xl',
          invert ? 'text-white' : 'text-foreground'
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-balance',
            invert ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}
