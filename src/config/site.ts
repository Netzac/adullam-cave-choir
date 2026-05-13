export const siteConfig = {
  name: 'Adullam Cave Choir',
  tagline: 'from the Cave to the Stage',
  description:
    'Training young choristers, worship singers, instrumentalists, plus equipment installation and workshops for churches and institutions.',
  location: 'Accra, Ghana',
  timezone: 'Africa/Accra',
  currency: 'GHS',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;
