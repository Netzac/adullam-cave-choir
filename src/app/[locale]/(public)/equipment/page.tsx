import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EquipmentClient } from './EquipmentClient';
import { createClient } from '@/lib/supabase/server';
import * as equipmentQueries from '@/lib/supabase/queries/equipment';
import { placeholderEquipment } from '@/lib/constants/placeholders';
import type { EquipmentRecord } from '@/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('equipmentPage.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

async function loadCases(): Promise<EquipmentRecord[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return placeholderEquipment;
  }
  try {
    const supabase = createClient();
    const rows = await equipmentQueries.getAll(supabase);
    const completed = rows.filter((r) => r.status === 'completed');
    return completed.length > 0 ? completed : placeholderEquipment;
  } catch {
    return placeholderEquipment;
  }
}

export default async function EquipmentPage() {
  const cases = await loadCases();
  return <EquipmentClient cases={cases} />;
}
