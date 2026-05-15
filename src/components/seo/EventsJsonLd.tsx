import type { ChoirEvent } from '@/types/database';
import { siteConfig } from '@/config/site';
import { JsonLd } from '@/components/seo/JsonLd';

interface EventsJsonLdProps {
  events: ChoirEvent[];
}

export function EventsJsonLd({ events }: EventsJsonLdProps) {
  const items = events.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.time ? `${event.date}T${event.time}` : event.date,
    eventStatus:
      event.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.is_online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.is_online
      ? {
          '@type': 'VirtualLocation',
          url: siteConfig.url,
        }
      : {
          '@type': 'Place',
          name: event.venue ?? 'Accra, Ghana',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Accra',
            addressCountry: 'GH',
          },
        },
    organizer: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    offers:
      event.fee != null
        ? {
            '@type': 'Offer',
            price: event.fee,
            priceCurrency: event.currency ?? 'GHS',
            availability: 'https://schema.org/InStock',
          }
        : undefined,
  }));

  if (items.length === 0) return null;
  return <JsonLd data={items} />;
}
