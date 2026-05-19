import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GalleryView } from './GalleryView';
import { createClient } from '@/lib/supabase/server';
import * as galleryQueries from '@/lib/supabase/queries/gallery';
import { placeholderGallery } from '@/lib/constants/placeholders';
import type { GalleryItem } from '@/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('gallery.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

async function loadGallery(): Promise<GalleryItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return placeholderGallery;
  }
  try {
    const supabase = createClient();
    const items = await galleryQueries.getAll(supabase, { publishedOnly: true });
    return items.length > 0 ? items : placeholderGallery;
  } catch {
    return placeholderGallery;
  }
}

export default async function GalleryPage() {
  const items = await loadGallery();
  return <GalleryView items={items} />;
}
