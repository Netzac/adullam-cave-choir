'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errorPages.error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-purple-950/20 via-background to-background px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-500/30">
        <AlertTriangle className="h-8 w-8 text-rose-500" aria-hidden />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight md:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t('description')}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset} className="bg-gold hover:bg-gold-600 text-purple-950">
          {t('retry')}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </div>
  );
}
