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
import { createClient } from '@/lib/supabase/server';
import * as eventQueries from '@/lib/supabase/queries/events';
import * as galleryQueries from '@/lib/supabase/queries/gallery';
import * as blogQueries from '@/lib/supabase/queries/blog';
import {
  placeholderEvents,
  placeholderGallery,
  placeholderBlog,
} from '@/lib/constants/placeholders';
import { siteConfig } from '@/config/site';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';
import type { BlogPost, ChoirEvent, GalleryItem } from '@/types/database';

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

type HomeData = {
  events: ChoirEvent[];
  gallery: GalleryItem[];
  posts: BlogPost[];
};

async function loadHomeData(): Promise<HomeData> {
  const fallback: HomeData = {
    events: placeholderEvents,
    gallery: placeholderGallery,
    posts: placeholderBlog,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return fallback;
  }

  try {
    const supabase = createClient();
    const [events, gallery, posts] = await Promise.all([
      eventQueries.getUpcoming(supabase, 6),
      galleryQueries.getFeatured(supabase, 9),
      blogQueries.getPublished(supabase, 3),
    ]);
    return {
      events: events.length > 0 ? events : fallback.events,
      gallery: gallery.length > 0 ? gallery : fallback.gallery,
      posts: posts.length > 0 ? posts : fallback.posts,
    };
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const { events, gallery, posts } = await loadHomeData();

  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />
      <MissionStrip />
      <AboutPreview />
      <ProgramsPreview />
      <UpcomingEvents events={events} />
      <GalleryPreview items={gallery} />
      <EquipmentPreview />
      <DonationCTA />
      <TestimonialsSection />
      <BlogPreview posts={posts} />
      <ContactStrip />
    </>
  );
}
