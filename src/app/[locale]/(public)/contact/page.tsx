import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactView } from './ContactView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contactPage.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function ContactPage() {
  return <ContactView />;
}
