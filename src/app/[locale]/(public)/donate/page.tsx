import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DonateView } from './DonateView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('donate.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function DonatePage() {
  return <DonateView />;
}
