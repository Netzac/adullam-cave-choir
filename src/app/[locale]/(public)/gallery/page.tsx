import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GalleryView } from './GalleryView';
import { placeholderGallery } from '@/lib/constants/placeholders';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('gallery.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function GalleryPage() {
  return <GalleryView items={placeholderGallery} />;
}
