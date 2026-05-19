import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ApplyView } from './ApplyView';
import { createClient } from '@/lib/supabase/server';
import * as programQueries from '@/lib/supabase/queries/programs';
import { placeholderPrograms } from '@/lib/constants/placeholders';
import type { Program } from '@/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('apply.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

async function loadPrograms(): Promise<Program[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return placeholderPrograms;
  }
  try {
    const supabase = createClient();
    const rows = await programQueries.getActive(supabase);
    return rows.length > 0 ? rows : placeholderPrograms;
  } catch {
    return placeholderPrograms;
  }
}

export default async function ApplyPage() {
  const programs = await loadPrograms();
  return <ApplyView programs={programs} />;
}
