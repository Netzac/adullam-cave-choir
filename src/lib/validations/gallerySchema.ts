import { z } from 'zod';

export const GALLERY_CATEGORY_VALUES = [
  'performances',
  'rehearsals',
  'workshops',
  'equipment',
  'events',
  'community',
] as const;

export const GALLERY_MEDIA_TYPE_VALUES = [
  'image',
  'video',
  'youtube',
  'vimeo',
] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Schema used to validate the metadata of a new gallery item, regardless of
 * whether it comes from an uploaded image, an uploaded video, or a YouTube /
 * Vimeo embed URL. Media-specific fields are validated separately at submit
 * time so we can surface friendlier per-source errors.
 */
export const galleryItemMetaSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.trim() ? v : null)),
  category: z.enum(GALLERY_CATEGORY_VALUES).default('performances'),
  date_taken: z
    .string()
    .trim()
    .regex(DATE_RE, 'Pick a valid date (YYYY-MM-DD)')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.trim() ? v : null)),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export type GalleryItemMetaInput = z.infer<typeof galleryItemMetaSchema>;

/**
 * Schema for editing existing items. Subset of fields the dialog allows the
 * admin to change — file URLs and media type are not editable here.
 */
export const galleryItemEditSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.trim() ? v : null)),
  category: z.enum(GALLERY_CATEGORY_VALUES),
  is_featured: z.boolean(),
  is_published: z.boolean(),
});

export type GalleryItemEditInput = z.infer<typeof galleryItemEditSchema>;

/**
 * Recognize a YouTube or Vimeo URL and return the inferred media type, the
 * canonical embed URL, and a best-effort thumbnail URL. Returns null if the
 * URL is not recognized.
 */
export function parseEmbedUrl(raw: string):
  | {
      mediaType: 'youtube' | 'vimeo';
      embedUrl: string;
      thumbnailUrl: string | null;
    }
  | null {
  const url = raw.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    // youtu.be/<id>
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (id) {
        return {
          mediaType: 'youtube',
          embedUrl: `https://www.youtube.com/watch?v=${id}`,
          thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        };
      }
    }

    // youtube.com/watch?v=<id> or /embed/<id> or /shorts/<id>
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) {
        return {
          mediaType: 'youtube',
          embedUrl: `https://www.youtube.com/watch?v=${v}`,
          thumbnailUrl: `https://img.youtube.com/vi/${v}/hqdefault.jpg`,
        };
      }
      const segs = parsed.pathname.split('/').filter(Boolean);
      const idx = segs.findIndex((s) => s === 'embed' || s === 'shorts');
      if (idx >= 0 && segs[idx + 1]) {
        const id = segs[idx + 1];
        return {
          mediaType: 'youtube',
          embedUrl: `https://www.youtube.com/watch?v=${id}`,
          thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        };
      }
    }

    // vimeo.com/<id>
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const segs = parsed.pathname.split('/').filter(Boolean);
      const id = segs.find((s) => /^\d+$/.test(s));
      if (id) {
        return {
          mediaType: 'vimeo',
          embedUrl: `https://vimeo.com/${id}`,
          thumbnailUrl: null,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}
