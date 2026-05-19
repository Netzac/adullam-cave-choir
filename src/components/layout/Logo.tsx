'use client';

import * as React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export function Logo({ className, variant = 'light', showTagline = false }: LogoProps) {
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <Link
      href="/"
      aria-label="Adullam Cave Choir — Home"
      className={cn('group inline-flex items-center gap-2', className)}
    >
      {imgFailed ? (
        <span
          aria-hidden
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand font-serif text-base font-bold text-white shadow-glow ring-1 transition-transform group-hover:scale-105',
            variant === 'dark' ? 'ring-white/10' : 'ring-purple-800/20'
          )}
        >
          A
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            'relative inline-flex h-9 w-9 items-center justify-center transition-transform group-hover:scale-105',
            variant === 'dark' && 'brightness-0 invert'
          )}
        >
          <Image
            src="/images/logo.png"
            alt=""
            fill
            sizes="36px"
            className="object-contain"
            onError={() => setImgFailed(true)}
            priority
          />
        </span>
      )}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-serif text-lg font-semibold tracking-tight',
            variant === 'dark' ? 'text-white' : 'text-foreground'
          )}
        >
          Adullam <span className="text-gradient-brand">Cave</span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gold-500/90">
            from the Cave to the Stage
          </span>
        )}
      </span>
    </Link>
  );
}
