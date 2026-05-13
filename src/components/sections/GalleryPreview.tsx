'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Camera } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';
import type { GalleryItem } from '@/types/database';

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  const t = useTranslations('home.gallery');
  const cta = useTranslations('cta');

  const six = items.slice(0, 6);

  const heights = ['h-72', 'h-56', 'h-80', 'h-64', 'h-72', 'h-56'];

  return (
    <section className="container py-20 md:py-28">
      <SectionHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
        {six.map((item, i) => {
          const img = item.thumbnail_url || item.file_url;
          return (
            <motion.figure
              key={item.id}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-muted ${heights[i % heights.length]}`}
            >
              {img ? (
                <Image
                  src={img}
                  alt={item.title ?? 'Gallery image'}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900 to-dark">
                  <Camera className="h-10 w-10 text-gold-400/70" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {item.title}
              </figcaption>
            </motion.figure>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" className="group">
          <Link href="/gallery">
            {cta('viewAll')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
