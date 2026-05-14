import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HowToApplyView } from './HowToApplyView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('howToApply.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function HowToApplyPage() {
  return <HowToApplyView />;
}
