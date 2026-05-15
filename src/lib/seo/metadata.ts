import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { routing, type Locale } from '@/i18n/routing';

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  ogImage?: string;
  noIndex?: boolean;
};

function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized || '/';
  return `/${locale}${normalized === '/' ? '' : normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  locale,
  ogImage,
  noIndex,
}: PageMetadataInput): Metadata {
  const canonicalPath = localizedPath(path, locale);
  const canonical = new URL(canonicalPath, siteConfig.url).toString();
  const image = ogImage ?? siteConfig.ogImage;
  const ogLocale = locale === 'fr' ? 'fr_GH' : 'en_GH';

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = new URL(localizedPath(path, loc), siteConfig.url).toString();
  }
  languages['x-default'] = new URL(
    localizedPath(path, routing.defaultLocale),
    siteConfig.url,
  ).toString();

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: ogLocale,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === 'fr' ? 'fr_GH' : 'en_GH')),
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 630, alt: siteConfig.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
