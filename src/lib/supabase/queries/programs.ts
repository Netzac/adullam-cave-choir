import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Program } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Program[];
}

export async function getActive(client: Client) {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Program[];
}

export async function getById(client: Client, id: string) {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Program;
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['programs']['Insert']
) {
  const { data, error } = await client.from('programs').insert(input).select().single();
  if (error) throw error;
  return data as Program;
}

export async function update(
  client: Client,
  id: string,
  patch: Database['public']['Tables']['programs']['Update']
) {
  const { data, error } = await client
    .from('programs')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Program;
}
