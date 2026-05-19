import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EventsView } from './EventsView';
import { createClient } from '@/lib/supabase/server';
import * as eventQueries from '@/lib/supabase/queries/events';
import { placeholderEvents, placeholderPastEvents } from '@/lib/constants/placeholders';
import { EventsJsonLd } from '@/components/seo/EventsJsonLd';
import type { ChoirEvent } from '@/types/database';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('events.hero');
  return { title: `${t('title')} — Adullam Cave Choir`, description: t('subtitle') };
}

type EventsData = { upcoming: ChoirEvent[]; past: ChoirEvent[] };

async function loadEvents(): Promise<EventsData> {
  const fallback: EventsData = {
    upcoming: placeholderEvents,
    past: placeholderPastEvents,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallback;
  }

  try {
    const supabase = createClient();
    const [upcoming, all] = await Promise.all([
      eventQueries.getUpcoming(supabase, 24),
      eventQueries.getAll(supabase),
    ]);
    const past = all.filter((e) => e.status === 'completed').slice(0, 24);
    return {
      upcoming: upcoming.length > 0 ? upcoming : fallback.upcoming,
      past: past.length > 0 ? past : fallback.past,
    };
  } catch {
    return fallback;
  }
}

export default async function EventsPage() {
  const { upcoming, past } = await loadEvents();
  return (
    <>
      <EventsJsonLd events={[...upcoming, ...past]} />
      <EventsView upcoming={upcoming} past={past} />
    </>
  );
}
