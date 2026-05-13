import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Donation } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function create(
  client: Client,
  input: Database['public']['Tables']['donations']['Insert']
) {
  const { data, error } = await client.from('donations').insert(input).select().single();
  if (error) throw error;
  return data as Donation;
}

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Donation[];
}
