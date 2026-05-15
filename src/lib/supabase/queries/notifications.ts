import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AppNotification } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as AppNotification[];
}

export async function getUnread(client: Client) {
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as AppNotification[];
}

export async function markAllAsRead(client: Client) {
  const { error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw error;
}

export async function markAsRead(client: Client, id: string) {
  const { data, error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AppNotification;
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['notifications']['Insert']
) {
  const { data, error } = await client.from('notifications').insert(input).select().single();
  if (error) throw error;
  return data as AppNotification;
}
