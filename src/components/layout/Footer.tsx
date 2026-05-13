'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, Music2, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { siteConfig, footerColumns, type SocialLink } from '@/config/site';
import { Logo } from './Logo';

const socialIcons: Record<SocialLink['name'], React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  x: Twitter,
};

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-dark text-light/85">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo variant="dark" showTagline />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-light/65">
              {siteConfig.description}
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-light/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>
                  {siteConfig.contact.address.line1}
                  <br />
                  {siteConfig.contact.address.line2}, {siteConfig.contact.address.country}
                </span>
              </li>
              <li className="flex items-center gap-3 text-light/70">
                <Mail className="h-4 w-4 shrink-0 text-gold-500" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-gold">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-light/70">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                  className="hover:text-gold"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
            </ul>
          </div>

          <FooterColumn title={t('footer.quickLinks')} links={footerColumns.quickLinks} />
          <FooterColumn title={t('footer.programs')} links={footerColumns.programs} />
          <FooterColumn title={t('footer.services')} links={footerColumns.services} />

          <div className="lg:col-span-2">
            <h4 className="font-serif text-base font-semibold text-light">
              {t('footer.connect')}
            </h4>
            <div
              aria-hidden
              className="mt-3 h-px w-10 bg-gradient-to-r from-gold to-transparent"
            />
            <ul className="mt-5 flex flex-wrap gap-2">
              {siteConfig.social.map((s) => {
                const Icon = socialIcons[s.name];
                return (
                  <li key={s.name}>
                    <motion.a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label}
                      whileHover={{ y: -2, scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-light/80 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent"
      />

      <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-light/60 md:flex-row">
        <p>
          © {year} {siteConfig.name}. {t('footer.rights')}
        </p>
        <p className="italic">{t('footer.madeIn')}</p>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: ReadonlyArray<{ href: string; labelKey: string }>;
}

function FooterColumn({ title, links }: FooterColumnProps) {
  const t = useTranslations();
  return (
    <div className="lg:col-span-2">
      <h4 className="font-serif text-base font-semibold text-light">{title}</h4>
      <div aria-hidden className="mt-3 h-px w-10 bg-gradient-to-r from-gold to-transparent" />
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-light/70 transition-colors hover:text-gold"
            >
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
