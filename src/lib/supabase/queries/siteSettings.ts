import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

export async function getAllAsMap(client: Client): Promise<Record<string, unknown>> {
  const { data, error } = await client.from('site_settings').select('key, value');
  if (error) throw error;
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

export async function upsertMany(
  client: Client,
  entries: Record<string, unknown>
): Promise<void> {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return;
  const { error } = await client
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

/** Coerce a jsonb setting value to a string for form fields. */
export function settingToString(
  map: Record<string, unknown>,
  key: string,
  fallback = ''
): string {
  const raw = map[key];
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  return fallback;
}
