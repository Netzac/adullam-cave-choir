export type NavLink = {
  href: string;
  labelKey: string;
};

export type SocialLink = {
  name: 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'x';
  href: string;
  label: string;
};

export const siteConfig = {
  name: 'Adullam Cave Choir',
  shortName: 'Adullam Cave',
  tagline: 'from the Cave to the Stage',
  description:
    'Adullam Cave Choir trains young choristers, worship singers, and instrumentalists in Accra, Ghana — and equips churches and institutions with workshops and audio equipment installation.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.jpg',
  locale: { default: 'en', timezone: 'Africa/Accra', currency: 'GHS' },
  contact: {
    email: 'hello@adullamcavechoir.org',
    phone: '+233 00 000 0000',
    whatsapp: '+233 00 000 0000',
    address: {
      line1: 'Adullam Cave Choir HQ',
      line2: 'Accra, Greater Accra Region',
      country: 'Ghana',
    },
  },
  social: [
    { name: 'facebook', href: 'https://facebook.com/adullamcavechoir', label: 'Facebook' },
    { name: 'instagram', href: 'https://instagram.com/adullamcavechoir', label: 'Instagram' },
    { name: 'youtube', href: 'https://youtube.com/@adullamcavechoir', label: 'YouTube' },
    { name: 'tiktok', href: 'https://tiktok.com/@adullamcavechoir', label: 'TikTok' },
    { name: 'x', href: 'https://x.com/adullamcave', label: 'X (Twitter)' },
  ] satisfies SocialLink[],
} as const;

export const navLinks: NavLink[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/programs', labelKey: 'nav.programs' },
  { href: '/workshops', labelKey: 'nav.workshops' },
  { href: '/gallery', labelKey: 'nav.gallery' },
  { href: '/equipment', labelKey: 'nav.equipment' },
  { href: '/contact', labelKey: 'nav.contact' },
];

export const footerColumns = {
  quickLinks: [
    { href: '/about', labelKey: 'nav.about' },
    { href: '/gallery', labelKey: 'nav.gallery' },
    { href: '/contact', labelKey: 'nav.contact' },
    { href: '/apply', labelKey: 'cta.applyNow' },
  ],
  programs: [
    { href: '/programs#choristers', labelKey: 'programs.choristers' },
    { href: '/programs#worship', labelKey: 'programs.worship' },
    { href: '/programs#instruments', labelKey: 'programs.instruments' },
  ],
  services: [
    { href: '/workshops', labelKey: 'nav.workshops' },
    { href: '/equipment', labelKey: 'services.equipmentInstall' },
  ],
} as const;
