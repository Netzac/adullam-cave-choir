import { siteConfig } from '@/config/site';
import { JsonLd } from '@/components/seo/JsonLd';

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: new URL('/og-image.jpg', siteConfig.url).toString(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      availableLanguage: ['English', 'French'],
    },
    sameAs: siteConfig.social.map((s) => s.href),
  };

  return <JsonLd data={data} />;
}
