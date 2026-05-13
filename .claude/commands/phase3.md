Build all public pages for Adullam Cave Choir with world-class UI/UX. Every page must be:
- Fully responsive (mobile-first)
- Animated with Framer Motion (scroll reveals, entrances, micro-interactions)
- SEO optimized with metadata
- Using next-intl for all text
- Using the brand colors: Purple (#6B21A8), Gold (#D97706), Dark (#0F0A1E)
- Cinematic, elegant, and worship-inspired in feel

Build these pages and sections:

## HOME PAGE (src/app/[locale]/(public)/page.tsx)
Sections in order:
1. HeroSection — Full viewport height, dark purple gradient background, animated musical note particles, large headline "from the Cave to the Stage", subheadline about the choir's mission, two CTAs: "Apply to Join" (gold button) and "Watch Our Story" (outline button), scroll indicator animation
2. MissionStrip — Three animated stat cards: Years of Excellence, Choristers Trained, Churches Served
3. AboutPreview — Split layout: text left (who we are, mission), image placeholder right, "Learn More" link
4. ProgramsPreview — Horizontal scroll cards showing 3 featured programs with icons, title, brief description
5. UpcomingEvents — Next 3 upcoming workshops/events from database, card layout with date badge
6. GalleryPreview — Masonry grid of 6 featured gallery items with hover zoom and lightbox
7. EquipmentPreview — Dark section showcasing equipment installation services with icons
8. DonationCTA — Full-width purple gradient section: "Support the Vision", donation amount selector, Paystack integration placeholder
9. TestimonialsSection — Carousel of testimonials (placeholder data)
10. BlogPreview — Latest 3 blog/news posts
11. ContactStrip — Quick contact info + social links + "Get In Touch" button

## ABOUT PAGE (src/app/[locale]/(public)/about/page.tsx)
- Hero with page title and breadcrumb
- History and founding story section
- Vision, Mission, and Values (animated cards)
- Training philosophy section
- Equipment services mention
- Leadership/team section (placeholder cards)
- CTA to apply

## PROGRAMS PAGE (src/app/[locale]/(public)/programs/page.tsx)
- Hero section
- Filter tabs: All / Young Choristers / Worship Leadership / Instrument Training
- Program cards fetched from database (use placeholder data if DB not connected yet)
- Each card: title, audience, duration, format badge, prerequisites, "Apply for this Program" button
- FAQ accordion at bottom

## WORKSHOPS & EVENTS PAGE (src/app/[locale]/(public)/events/page.tsx)
- Hero section
- Upcoming events grid (fetched from DB, placeholder data)
- Each event card: title, date/time, venue, capacity badge, fee, "Apply for Workshop" button
- "Request a Workshop for Your Institution" CTA section
- Past events section (collapsed)

## APPLICATION PAGE (src/app/[locale]/(public)/apply/page.tsx)
- Hero with "Apply to Join Adullam Cave Choir"
- Clear message: this is an application, not a registration
- Multi-step form (3 steps with progress indicator):
  Step 1: Personal Info (name, age, phone, email, passport photo optional)
  Step 2: Program Interest (interest level, preferred program, experience)
  Step 3: Consent & Submit (guardian consent checkbox for under 18, notes, review summary)
- Form validation with react-hook-form + zod
- Success state: elegant confirmation card with "We'll review your application and contact you"
- Submits to /api/applications

## GALLERY PAGE (src/app/[locale]/(public)/gallery/page.tsx)
- Hero section
- Category filter tabs: All / Programs & Rehearsals / Equipment Installations / Events & Worship
- Masonry photo grid with hover effects
- YouTube/Vimeo video embeds in separate video section
- Yet Another React Lightbox for full-screen viewing
- Infinite scroll or load more pagination

## EQUIPMENT PAGE (src/app/[locale]/(public)/equipment/page.tsx)
- Hero: "We Equip Churches for Worship"
- Services section: Installation, Configuration, Training, Support (animated cards)
- Equipment types: Piano, Organ, Keyboards, Sound Systems (icon cards)
- Case studies section (fetched from equipment_records, placeholder data)
- Each case study: church name, location, equipment type, date, description, related photos
- CTA: "Request Equipment Service" linking to contact form

## CONTACT PAGE (src/app/[locale]/(public)/contact/page.tsx)
- Hero
- Contact form (name, email, phone, subject, message) with zod validation
- Submits to /api/contact
- Contact info card: Accra Ghana address placeholder, email, phone
- Social media links with icons
- Google Maps embed placeholder
- "How to Apply" info box linking to /apply

## HOW TO APPLY PAGE (src/app/[locale]/(public)/how-to-apply/page.tsx)
- Step by step process (animated timeline)
- Eligibility criteria
- FAQ accordion
- Link to application form

## DONATE/SPONSOR PAGE (src/app/[locale]/(public)/donate/page.tsx)
- Hero: "Support the Vision"
- Mission impact statement
- Sponsorship tiers: Sponsor a Chorister, Equip a Church, General Support
- Custom amount input
- Donor name and message fields
- Paystack payment integration
- Recent donors display (optional, with permission)

After building all pages, create the API routes:
- POST /api/applications — save to Supabase, send confirmation email via Resend
- POST /api/contact — save and notify admin via email
- POST /api/donations — initialize Paystack transaction

Show me the file tree when done.