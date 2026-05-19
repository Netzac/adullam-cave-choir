import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/sections/PageHero';
import { createClient } from '@/lib/supabase/server';
import * as blogQueries from '@/lib/supabase/queries/blog';
import { placeholderBlog } from '@/lib/constants/placeholders';
import type { BlogPost } from '@/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blogPage.hero');
  return {
    title: `${t('title')} — Adullam Cave Choir`,
    description: t('subtitle'),
  };
}

async function loadPosts(): Promise<BlogPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return placeholderBlog;
  }
  try {
    const supabase = createClient();
    const rows = await blogQueries.getPublished(supabase);
    return rows.length > 0 ? rows : placeholderBlog;
  } catch {
    return placeholderBlog;
  }
}

export default async function BlogIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [posts, t, nav, blogT] = await Promise.all([
    loadPosts(),
    getTranslations('blogPage.hero'),
    getTranslations('nav'),
    getTranslations('blogPage'),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: t('title') },
        ]}
      />

      <section className="container py-16 md:py-20">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
            {blogT('empty')}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-elevated"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/10 via-muted to-gold-500/10 text-muted-foreground"
                      >
                        <ImageIcon className="h-10 w-10 opacity-60" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {post.published_at ? (
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {dateFormatter.format(new Date(post.published_at))}
                      </p>
                    ) : null}
                    <h2 className="mt-2 font-serif text-xl font-bold leading-snug transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-5 inline-flex items-center text-sm font-medium text-primary">
                      {blogT('readMore')}
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
