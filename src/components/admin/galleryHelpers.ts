import type { GalleryCategory } from '@/types/database';

/**
 * The admin gallery filter exposes 4 buckets per the spec: All / Programs /
 * Installations / Events. Several DB categories collapse into "Programs"
 * because the public site groups them the same way.
 */
export type GalleryFilterValue = 'all' | 'programs' | 'installations' | 'events';

export const GALLERY_FILTER_VALUES: GalleryFilterValue[] = [
  'all',
  'programs',
  'installations',
  'events',
];

const PROGRAM_CATEGORIES: GalleryCategory[] = [
  'performances',
  'rehearsals',
  'workshops',
  'community',
];

export function categoryMatchesFilter(
  category: GalleryCategory,
  filter: GalleryFilterValue
): boolean {
  if (filter === 'all') return true;
  if (filter === 'programs') return PROGRAM_CATEGORIES.includes(category);
  if (filter === 'installations') return category === 'equipment';
  if (filter === 'events') return category === 'events';
  return true;
}

export const CATEGORY_TONE: Record<GalleryCategory, string> = {
  performances: 'bg-purple-100 text-purple-800 border-purple-200',
  rehearsals: 'bg-sky-100 text-sky-800 border-sky-200',
  workshops: 'bg-amber-100 text-amber-800 border-amber-200',
  equipment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  events: 'bg-rose-100 text-rose-800 border-rose-200',
  community: 'bg-slate-100 text-slate-700 border-slate-200',
};

/**
 * Best-effort thumbnail picker for a gallery item card.
 */
export function pickThumbnail(item: {
  thumbnail_url: string | null;
  file_url: string | null;
  youtube_url: string | null;
}): string | null {
  return item.thumbnail_url || item.file_url || extractYouTubeThumb(item.youtube_url);
}

function extractYouTubeThumb(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
    }
  } catch {
    return null;
  }
  return null;
}
