'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { useTranslations } from 'next-intl';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/sections/PageHero';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types/database';

type Filter = 'all' | 'programs' | 'equipment' | 'events';

const PAGE_SIZE = 8;

const matchesFilter = (item: GalleryItem, f: Filter) => {
  if (f === 'all') return true;
  const c = (item.category ?? '').toLowerCase();
  if (f === 'programs') return ['programs', 'rehearsals', 'workshops'].includes(c);
  if (f === 'equipment') return c === 'equipment';
  if (f === 'events') return ['events', 'performances', 'community'].includes(c);
  return true;
};

const youtubeId = (url: string | null) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const hero = useTranslations('gallery.hero');
  const nav = useTranslations('nav');
  const filters = useTranslations('gallery.filters');
  const videos = useTranslations('gallery.videos');
  const t = useTranslations('gallery');

  const [filter, setFilter] = React.useState<Filter>('all');
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = React.useState(-1);

  const photos = React.useMemo(
    () => items.filter((i) => i.media_type === 'image' && matchesFilter(i, filter)),
    [items, filter],
  );

  const videoItems = React.useMemo(
    () => items.filter((i) => i.media_type === 'youtube' && i.youtube_url),
    [items],
  );

  type Slide = {
    src: string;
    alt: string;
    title: string;
    description: string | undefined;
  };
  const slides: Slide[] = photos.flatMap((p) => {
    const src = p.file_url ?? p.thumbnail_url ?? null;
    if (!src) return [];
    return [
      {
        src,
        alt: p.title ?? 'Gallery image',
        title: p.title ?? '',
        description: p.description ?? undefined,
      },
    ];
  });

  React.useEffect(() => setVisible(PAGE_SIZE), [filter]);

  const heights = ['h-72', 'h-56', 'h-80', 'h-64'];

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: filters('all') },
    { key: 'programs', label: filters('programs') },
    { key: 'equipment', label: filters('equipment') },
    { key: 'events', label: filters('events') },
  ];

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('gallery') },
        ]}
      />

      <section className="container py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                filter === tab.key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {photos.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          <>
            <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
              <AnimatePresence mode="popLayout">
                {photos.slice(0, visible).map((p, i) => {
                  const src = p.thumbnail_url ?? p.file_url;
                  if (!src) return null;
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.45, delay: (i % PAGE_SIZE) * 0.04 }}
                      onClick={() => setLightboxIndex(i)}
                      className={cn(
                        'group relative block w-full overflow-hidden rounded-2xl border border-border/50 bg-muted text-left',
                        heights[i % heights.length],
                      )}
                    >
                      <Image
                        src={src}
                        alt={p.title ?? 'Gallery image'}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {p.title}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {visible < photos.length ? (
              <div className="mt-10 flex justify-center">
                <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  {t('loadMore')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {videoItems.length > 0 ? (
        <section className="bg-muted/30 py-20 md:py-24">
          <div className="container">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
                {videos('title')}
              </h2>
              <p className="mt-2 text-muted-foreground">{videos('subtitle')}</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoItems.map((v, i) => {
                const id = youtubeId(v.youtube_url);
                if (!id) return null;
                return (
                  <motion.a
                    key={v.id}
                    href={v.youtube_url ?? `https://www.youtube.com/watch?v=${id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:shadow-elevated"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                        alt={v.title ?? 'Video'}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                        <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-bold">{v.title}</h3>
                      {v.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                      ) : null}
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={slides}
      />
    </>
  );
}
