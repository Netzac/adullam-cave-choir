import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ChoirEvent } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('events')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as ChoirEvent[];
}

export async function getUpcoming(client: Client, limit = 12) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await client
    .from('events')
    .select('*')
    .gte('date', today)
    .in('status', ['scheduled', 'live'])
    .order('date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as ChoirEvent[];
}

export async function getById(client: Client, id: string) {
  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ChoirEvent;
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['events']['Insert']
) {
  const { data, error } = await client.from('events').insert(input).select().single();
  if (error) throw error;
  return data as ChoirEvent;
}

export async function update(
  client: Client,
  id: string,
  patch: Database['public']['Tables']['events']['Update']
) {
  const { data, error } = await client
    .from('events')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ChoirEvent;
}
