import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import * as blogQueries from '@/lib/supabase/queries/blog';
import { placeholderBlog } from '@/lib/constants/placeholders';
import { routing } from '@/i18n/routing';
import type { BlogPost } from '@/types/database';

interface BlogDetailParams {
  params: { locale: string; slug: string };
}

async function fetchPost(slug: string): Promise<BlogPost | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient();
      const post = await blogQueries.getBySlug(supabase, slug);
      if (post && post.is_published) return post;
    } catch {
      // Fall through to placeholder lookup so the route works without Supabase.
    }
  }
  return placeholderBlog.find((p) => p.slug === slug && p.is_published) ?? null;
}

export async function generateStaticParams() {
  // Pre-render placeholder slugs so the route exists without Supabase at build
  // time. Real posts will be served via dynamic rendering on demand.
  const slugs = new Set(placeholderBlog.map((p) => p.slug));

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient();
      const rows = await blogQueries.getPublished(supabase);
      for (const row of rows) {
        if (row.slug) slugs.add(row.slug);
      }
    } catch {
      // Build-time fetches can fail in offline / preview environments; that's fine.
    }
  }

  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params: { slug },
}: BlogDetailParams): Promise<Metadata> {
  const post = await fetchPost(slug);
  if (!post) {
    const t = await getTranslations('blogPage');
    return { title: `${t('notFound')} — Adullam Cave Choir` };
  }
  return {
    title: `${post.title} — Adullam Cave Choir`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params: { locale, slug } }: BlogDetailParams) {
  const post = await fetchPost(slug);
  if (!post) notFound();

  const [blogT, navT] = await Promise.all([
    getTranslations('blogPage'),
    getTranslations('nav'),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const publishedLabel = post.published_at
    ? blogT('publishedOn', { date: dateFormatter.format(new Date(post.published_at)) })
    : null;

  return (
    <article className="bg-muted/20">
      <header className="border-b border-border/60 bg-background">
        <div className="container py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              {navT('home')}
            </Link>
            <span aria-hidden>›</span>
            <Link href="/blog" className="hover:underline">
              {blogT('hero.title')}
            </Link>
          </nav>

          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-balance md:text-6xl">
            {post.title}
          </h1>
          {publishedLabel ? (
            <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
              {publishedLabel}
            </p>
          ) : null}
          {post.excerpt ? (
            <p className="mt-5 max-w-3xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </header>

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft">
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/15 via-muted to-gold-500/15 text-muted-foreground"
              >
                <ImageIcon className="h-12 w-12 opacity-60" />
              </div>
            )}
          </div>

          <div
            className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-serif prose-headings:tracking-tight prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {!post.content?.trim() && post.excerpt ? (
            <p className="mt-10 text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-12 border-t border-border/60 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {blogT('backToList')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
