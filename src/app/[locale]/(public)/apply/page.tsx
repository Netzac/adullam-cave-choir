import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ApplyView } from './ApplyView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('apply.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function ApplyPage() {
  return <ApplyView />;
}
