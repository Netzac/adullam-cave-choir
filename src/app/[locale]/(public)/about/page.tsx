import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Eye, Compass, Heart, Music, ArrowRight, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/sections/PageHero';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function AboutPage() {
  return (
    <>
      <PageHeroBlock />
      <StoryBlock />
      <VMVBlock />
      <PhilosophyBlock />
      <EquipmentMentionBlock />
      <LeadershipBlock />
      <CTABlock />
    </>
  );
}

function PageHeroBlock() {
  const t = useTranslations('about.hero');
  const nav = useTranslations('nav');
  return (
    <PageHero
      eyebrow={t('eyebrow')}
      title={t('title')}
      subtitle={t('subtitle')}
      breadcrumb={[
        { label: nav('home'), href: '/' },
        { label: nav('about') },
      ]}
    />
  );
}

function StoryBlock() {
  const t = useTranslations('about.story');
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">{t('title')}</h2>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">{t('p1')}</p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{t('p2')}</p>
      </div>
    </section>
  );
}

function VMVBlock() {
  const t = useTranslations('about.vmv');
  const cards = [
    { icon: Eye, title: t('visionTitle'), body: t('visionBody'), grad: 'from-purple-600 to-purple-800' },
    { icon: Compass, title: t('missionTitle'), body: t('missionBody'), grad: 'from-gold to-gold-700' },
    { icon: Heart, title: t('valuesTitle'), body: t('valuesBody'), grad: 'from-crimson to-purple-700' },
  ];
  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container">
        <h2 className="text-center font-serif text-3xl font-bold tracking-tight md:text-5xl">
          {t('title')}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 shadow-soft transition-shadow hover:shadow-elevated"
            >
              <div
                aria-hidden
                className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${c.grad} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
              />
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.grad} text-white`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-bold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhilosophyBlock() {
  const t = useTranslations('about.philosophy');
  return (
    <section className="container py-20 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">{t('title')}</h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">{t('p1')}</p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{t('p2')}</p>
        </div>
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-purple-900 via-purple-800 to-dark">
            <div className="flex h-full items-center justify-center">
              <Music className="h-24 w-24 text-gold-400/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EquipmentMentionBlock() {
  const t = useTranslations('about.equipment');
  const cta = useTranslations('cta');
  return (
    <section className="container pb-20 md:pb-28">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-soft md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-serif text-2xl font-bold md:text-3xl">{t('title')}</h3>
            <p className="mt-3 text-muted-foreground">{t('body')}</p>
          </div>
          <Button asChild size="lg" className="group">
            <Link href="/equipment">
              {cta('learnMore')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function LeadershipBlock() {
  const t = useTranslations('about.leadership');
  const placeholders = [
    { name: 'Director Name', role: 'Founder & Music Director' },
    { name: 'Director Name', role: 'Worship Director' },
    { name: 'Director Name', role: 'Equipment & Tech Lead' },
  ];
  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">{t('title')}</h2>
          <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {placeholders.map((p, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-purple-900 to-dark text-gold-300">
                <Users className="h-12 w-12 opacity-70" />
              </div>
              <h3 className="mt-5 font-serif text-lg font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABlock() {
  const t = useTranslations('about.cta');
  const cta = useTranslations('cta');
  return (
    <section className="container py-20 md:py-28">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-dark p-10 text-center text-white shadow-elevated md:p-16">
        <h2 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">{t('title')}</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">{t('body')}</p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-gold text-dark shadow-glow-gold/40 hover:bg-gold-700 hover:text-white"
        >
          <Link href="/apply">{cta('applyNow')}</Link>
        </Button>
      </div>
    </section>
  );
}
