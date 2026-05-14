import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EquipmentClient } from './EquipmentClient';
import { placeholderEquipment } from '@/lib/constants/placeholders';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('equipmentPage.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function EquipmentPage() {
  return <EquipmentClient cases={placeholderEquipment} />;
}
