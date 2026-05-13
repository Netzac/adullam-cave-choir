import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Application, ApplicationStatus } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Application[];
}

export async function getById(client: Client, id: string) {
  const { data, error } = await client
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Application;
}

export async function updateStatus(
  client: Client,
  id: string,
  status: ApplicationStatus,
  internal_notes?: string
) {
  const { data, error } = await client
    .from('applications')
    .update({ status, ...(internal_notes !== undefined ? { internal_notes } : {}) })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['applications']['Insert']
) {
  const { data, error } = await client
    .from('applications')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}
