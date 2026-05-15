import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { routing, type Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import * as blogQueries from '@/lib/supabase/queries/blog';
import * as eventQueries from '@/lib/supabase/queries/events';
import { placeholderBlog, placeholderEvents } from '@/lib/constants/placeholders';

const PUBLIC_PATHS = [
  '',
  '/about',
  '/programs',
  '/events',
  '/gallery',
  '/equipment',
  '/contact',
  '/apply',
  '/how-to-apply',
  '/donate',
] as const;

function localizedUrl(path: string, locale: Locale): string {
  const base = siteConfig.url.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized === '/' ? base : `${base}${normalized}`;
  }
  return normalized === '/'
    ? `${base}/${locale}`
    : `${base}/${locale}${normalized}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: localizedUrl(path, locale),
        lastModified: now,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.8,
      });
    }
  }

  let posts = placeholderBlog.filter((p) => p.is_published);
  let events = placeholderEvents;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient();
      const [published, upcoming] = await Promise.all([
        blogQueries.getPublished(supabase),
        eventQueries.getUpcoming(supabase, 50),
      ]);
      if (published.length > 0) posts = published;
      if (upcoming.length > 0) events = upcoming;
    }
  } catch {
    // Fall back to placeholders when Supabase is unavailable at build time.
  }

  for (const locale of routing.locales) {
    for (const post of posts) {
      if (!post.slug) continue;
      entries.push({
        url: localizedUrl(`/blog/${post.slug}`, locale),
        lastModified: post.published_at
          ? new Date(post.published_at)
          : new Date(post.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const event of events) {
      entries.push({
        url: localizedUrl(`/events#${event.id}`, locale),
        lastModified: event.created_at ? new Date(event.created_at) : now,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }
  }

  return entries;
}
