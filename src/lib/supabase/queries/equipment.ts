import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, EquipmentRecord, GalleryItem } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAll(client: Client) {
  const { data, error } = await client
    .from('equipment_records')
    .select('*')
    .order('service_date', { ascending: false });
  if (error) throw error;
  return data as EquipmentRecord[];
}

export async function getById(client: Client, id: string) {
  const { data: record, error } = await client
    .from('equipment_records')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;

  const { data: links, error: linkError } = await client
    .from('equipment_gallery')
    .select('gallery_item_id, gallery_items(*)')
    .eq('equipment_record_id', id);
  if (linkError) throw linkError;

  const gallery = (links ?? [])
    .map((row) => (row as unknown as { gallery_items: GalleryItem | null }).gallery_items)
    .filter((g): g is GalleryItem => g !== null);

  return { ...(record as EquipmentRecord), gallery };
}

export async function create(
  client: Client,
  input: Database['public']['Tables']['equipment_records']['Insert']
) {
  const { data, error } = await client.from('equipment_records').insert(input).select().single();
  if (error) throw error;
  return data as EquipmentRecord;
}

export async function update(
  client: Client,
  id: string,
  patch: Database['public']['Tables']['equipment_records']['Update']
) {
  const { data, error } = await client
    .from('equipment_records')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EquipmentRecord;
}
