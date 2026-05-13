import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const t = useTranslations();

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-dark opacity-[0.04] dark:opacity-100"
      />
      <div className="container flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center py-24 text-center">
        <Badge variant="gold" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
          Accra, Ghana
        </Badge>
        <h1 className="font-serif text-balance text-5xl font-bold tracking-tight md:text-7xl">
          <span className="text-gradient-brand">{t('site.name')}</span>
        </h1>
        <p className="mt-4 font-serif text-lg italic text-gold-600 md:text-2xl">
          {t('site.tagline')}
        </p>
        <p className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground md:text-base">
          Training young choristers, worship singers, and instrumentalists — and equipping churches
          and institutions across Ghana through workshops and equipment installation.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-gold hover:bg-gold-700 text-white shadow-glow-gold/50">
            <Link href="/apply">{t('cta.applyNow')}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">{t('cta.learnMore')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
