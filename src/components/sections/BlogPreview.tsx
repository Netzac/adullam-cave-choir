'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useFormatter } from 'next-intl';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';
import type { BlogPost } from '@/types/database';

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const t = useTranslations('home.blog');
  const cta = useTranslations('cta');
  const format = useFormatter();

  const three = posts.slice(0, 3);

  return (
    <section className="container py-20 md:py-28">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          align="left"
          className="mx-0"
        />
        <Button asChild variant="ghost" className="self-end">
          <Link href="/blog">
            {cta('viewAll')}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {three.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-elevated"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
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
              <div className="p-6">
                {post.published_at ? (
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {format.dateTime(new Date(post.published_at), {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                ) : null}
                <h3 className="mt-2 font-serif text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Read article
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
