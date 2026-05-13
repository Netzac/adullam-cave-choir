'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
} as const;

export function ContactStrip() {
  const t = useTranslations('home.contact');
  const cta = useTranslations('cta');
  const contact = useTranslations('contact');

  return (
    <section className="container py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-soft md:p-12"
      >
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('subtitle')}
            </p>
            <Button asChild className="mt-8">
              <Link href="/contact">{cta('getInTouch')}</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background/60 p-5">
              <Mail className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                {contact('emailLabel')}
              </p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-1 block break-all text-sm font-medium hover:text-primary"
              >
                {siteConfig.contact.email}
              </a>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-5">
              <Phone className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                {contact('phoneLabel')}
              </p>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                className="mt-1 block text-sm font-medium hover:text-primary"
              >
                {siteConfig.contact.phone}
              </a>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-5 sm:col-span-2">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                {contact('addressLabel')}
              </p>
              <p className="mt-1 text-sm font-medium">
                {siteConfig.contact.address.line1}
                <br />
                {siteConfig.contact.address.line2}, {siteConfig.contact.address.country}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {contact('followUs')}
              </p>
              <div className="flex items-center gap-2">
                {siteConfig.social
                  .filter((s) => s.name in socialIcons)
                  .map((s) => {
                    const Icon = socialIcons[s.name as keyof typeof socialIcons];
                    return (
                      <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={s.label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
