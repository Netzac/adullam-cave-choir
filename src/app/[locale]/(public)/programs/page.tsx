import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProgramsView } from './ProgramsView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('programsPage.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function ProgramsPage() {
  return <ProgramsView />;
}
