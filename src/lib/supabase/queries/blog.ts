import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, BlogPost } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as BlogPost[];
}

export async function getPublished(client: Client, limit?: number) {
  let query = client
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data as BlogPost[];
}

export async function getBySlug(client: Client, slug: string) {
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['blog_posts']['Insert']
) {
  const { data, error } = await client.from('blog_posts').insert(input).select().single();
  if (error) throw error;
  return data as BlogPost;
}

export async function update(
  client: Client,
  id: string,
  patch: Database['public']['Tables']['blog_posts']['Update']
) {
  const { data, error } = await client
    .from('blog_posts')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BlogPost;
}
