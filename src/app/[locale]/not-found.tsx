import { getTranslations } from 'next-intl/server';
import { Music2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default async function LocaleNotFound() {
  const t = await getTranslations('errorPages.notFound');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-[#0F0A1E]/40 via-background to-background px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand font-serif text-2xl font-bold text-white shadow-glow ring-1 ring-white/10">
        <Music2 className="h-7 w-7" aria-hidden />
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-600 dark:text-gold-400">
        404
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t('description')}</p>
      <Button asChild className="mt-8 bg-gold hover:bg-gold-600 text-purple-950">
        <Link href="/">{t('home')}</Link>
      </Button>
    </div>
  );
}
