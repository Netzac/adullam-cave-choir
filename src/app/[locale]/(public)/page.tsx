import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { MissionStrip } from '@/components/sections/MissionStrip';
import { AboutPreview } from '@/components/sections/AboutPreview';
import { ProgramsPreview } from '@/components/sections/ProgramsPreview';
import { UpcomingEvents } from '@/components/sections/UpcomingEvents';
import { GalleryPreview } from '@/components/sections/GalleryPreview';
import { EquipmentPreview } from '@/components/sections/EquipmentPreview';
import { DonationCTA } from '@/components/sections/DonationCTA';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { BlogPreview } from '@/components/sections/BlogPreview';
import { ContactStrip } from '@/components/sections/ContactStrip';
import {
  placeholderEvents,
  placeholderGallery,
  placeholderBlog,
} from '@/lib/constants/placeholders';
import { siteConfig } from '@/config/site';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home.hero');
  return {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: t('subheadline'),
    openGraph: {
      title: siteConfig.name,
      description: t('subheadline'),
      type: 'website',
      url: siteConfig.url,
      siteName: siteConfig.name,
    },
  };
}

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />
      <MissionStrip />
      <AboutPreview />
      <ProgramsPreview />
      <UpcomingEvents events={placeholderEvents} />
      <GalleryPreview items={placeholderGallery} />
      <EquipmentPreview />
      <DonationCTA />
      <TestimonialsSection />
      <BlogPreview posts={placeholderBlog} />
      <ContactStrip />
    </>
  );
}
