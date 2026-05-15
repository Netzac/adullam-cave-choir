import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Client = SupabaseClient<Database>;

export type MonthlyCount = { month: string; count: number };
export type ProgramCount = { program: string; count: number };
export type DonationMonth = { month: string; total: number };

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export async function getApplicationsPerMonth(client: Client): Promise<MonthlyCount[]> {
  const { data, error } = await client
    .from('applications')
    .select('created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const key = monthKey(row.created_at);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
}

export async function getDonationsOverTime(client: Client): Promise<DonationMonth[]> {
  const { data, error } = await client
    .from('donations')
    .select('created_at, amount, status')
    .eq('status', 'success')
    .order('created_at', { ascending: true });
  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const key = monthKey(row.created_at);
    map.set(key, (map.get(key) ?? 0) + Number(row.amount));
  }
  return Array.from(map.entries()).map(([month, total]) => ({ month, total }));
}

export async function getPopularPrograms(client: Client): Promise<ProgramCount[]> {
  const { data, error } = await client
    .from('applications')
    .select('preferred_program');
  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const p = row.preferred_program || 'Unknown';
    map.set(p, (map.get(p) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([program, count]) => ({ program, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function getEventAttendanceTrends(client: Client): Promise<MonthlyCount[]> {
  const { data, error } = await client
    .from('event_applications')
    .select('created_at, status')
    .in('status', ['confirmed', 'attended']);
  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const key = monthKey(row.created_at);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
}
