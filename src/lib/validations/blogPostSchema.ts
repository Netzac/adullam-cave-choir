import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogPostSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required')
    .max(200)
    .regex(slugPattern, 'Use lowercase letters, numbers, and hyphens only'),
  content: z.string().trim().min(20, 'Content is too short'),
  excerpt: z.string().trim().max(500).optional().or(z.literal('')),
  cover_image_url: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().optional().or(z.literal('')),
  author_id: z.string().uuid().optional().or(z.literal('')),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
