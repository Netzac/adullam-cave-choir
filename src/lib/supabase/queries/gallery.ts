import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, GalleryItem, GalleryCategory } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client, { publishedOnly = false } = {}) {
  let query = client.from('gallery_items').select('*').order('created_at', { ascending: false });
  if (publishedOnly) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as GalleryItem[];
}

export async function getFeatured(client: Client, limit = 8) {
  const { data, error } = await client
    .from('gallery_items')
    .select('*')
    .eq('is_featured', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as GalleryItem[];
}

export async function getByCategory(client: Client, category: GalleryCategory) {
  const { data, error } = await client
    .from('gallery_items')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as GalleryItem[];
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['gallery_items']['Insert']
) {
  const { data, error } = await client.from('gallery_items').insert(input).select().single();
  if (error) throw error;
  return data as GalleryItem;
}

export async function update(
  client: Client,
  id: string,
  patch: Database['public']['Tables']['gallery_items']['Update']
) {
  const { data, error } = await client
    .from('gallery_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as GalleryItem;
}
