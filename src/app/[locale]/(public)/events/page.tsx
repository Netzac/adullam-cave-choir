import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EventsView } from './EventsView';
import { placeholderEvents, placeholderPastEvents } from '@/lib/constants/placeholders';
import { EventsJsonLd } from '@/components/seo/EventsJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('events.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

export default function EventsPage() {
  return (
    <>
      <EventsJsonLd events={[...placeholderEvents, ...placeholderPastEvents]} />
      <EventsView upcoming={placeholderEvents} past={placeholderPastEvents} />
    </>
  );
}
