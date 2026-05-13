Create the foundational structure for a Next.js 14 project called "Adullam Cave Choir" with the following setup:

1. Initialize a new Next.js 14 project in the current directory with:
   - TypeScript
   - App Router
   - Tailwind CSS
   - ESLint
   - src/ directory structure
   - Import alias @/*

2. Install these dependencies:
   - @supabase/supabase-js @supabase/ssr
   - next-intl
   - framer-motion
   - next-themes
   - @radix-ui/react-icons
   - lucide-react
   - embla-carousel-react
   - yet-another-react-lightbox
   - resend
   - @paystack/inline-js
   - zod
   - react-hook-form
   - @hookform/resolvers
   - shadcn/ui (initialize with: npx shadcn@latest init)
   - clsx
   - tailwind-merge
   - class-variance-authority

3. Create a CLAUDE.md file in the root with the following content:

# Adullam Cave Choir — Claude Code Instructions

## Project Overview
A music-choir web application for Adullam Cave Choir based in Accra, Ghana.
Tagline: "from the Cave to the Stage"
Purpose: Training young choristers, worship singers, instrument training, equipment installation services, workshops for churches and institutions.

## Tech Stack
- Framework: Next.js 14 (App Router, TypeScript)
- Database/Auth/Storage: Supabase
- Styling: Tailwind CSS + Shadcn/UI
- Animations: Framer Motion
- i18n: next-intl (English + French)
- Payments: Paystack
- Email: Resend
- WhatsApp: Twilio
- Deployment: Vercel

## Brand
- Primary: Purple (#6B21A8) and Gold (#D97706)
- Accent: Crimson (#8B1A1A)
- Dark backgrounds: #0F0A1E (deep purple-black)
- Light backgrounds: #FAFAF8
- Typography: Playfair Display (headings), Inter (body)
- Tone: Elegant, worshipful, inspiring, professional

## Project Structure
src/
  app/
    [locale]/         # i18n routing
      (public)/       # public pages
      (admin)/        # protected admin pages
  components/
    ui/               # shadcn components
    layout/           # navbar, footer, sidebar
    sections/         # page sections (hero, features, etc)
    forms/            # all form components
    gallery/          # gallery and media components
    admin/            # admin dashboard components
  lib/
    supabase/         # supabase client and helpers
    utils/            # utility functions
    validations/      # zod schemas
    constants/        # app constants
  hooks/              # custom React hooks
  types/              # TypeScript type definitions
  styles/             # global styles
  i18n/               # translation files (en, fr)
  config/             # app configuration

## Coding Standards
- Always use TypeScript with strict types. Never use `any`.
- Use server components by default. Add "use client" only when needed.
- All forms must use react-hook-form + zod validation.
- All database calls go through src/lib/supabase/ helpers, never inline.
- Use named exports for components, not default exports.
- Component files: PascalCase (e.g., HeroSection.tsx)
- Utility files: camelCase (e.g., formatDate.ts)
- Always handle loading, error, and empty states.
- Mobile-first responsive design always.
- Every public page must have proper SEO meta tags.
- All text must use next-intl translation keys, never hardcoded strings.
- Use Framer Motion for all animations. Keep them subtle and purposeful.

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
NEXT_PUBLIC_SITE_URL=

## Key Decisions
- No public user registration. Visitors submit applications only.
- Admin login via Supabase Auth (email/password). Super Admin role only for now.
- Timezone: Africa/Accra (GMT+0)
- Currency: GHS (₵)
- Languages: English (default) and French
- Videos: YouTube/Vimeo embeds for long videos, direct upload for short clips
- Payments: Paystack (supports GHS, Mobile Money, Card)

## Phase Plan
- Phase 1: Public frontend (currently building)
- Phase 2: Admin dashboard
- Phase 3: Payments, WhatsApp automation, advanced features

## Commands
See .claude/commands/ for reusable task commands.

4. Create .claude/commands/ directory with these command files:

.claude/commands/add-page.md:
# Add New Page
Create a new public page at the given route.
- Create the page in src/app/[locale]/(public)/
- Add SEO metadata
- Add translation keys in both en.json and fr.json
- Add Framer Motion entrance animation
- Make it fully responsive

.claude/commands/add-component.md:
# Add Component
Create a new React component.
- Place in the correct src/components/ subdirectory
- Use TypeScript with proper prop types
- Export as named export
- Add loading and error states if needed
- Make it responsive and animated with Framer Motion

.claude/commands/add-api-route.md:
# Add API Route
Create a new API route.
- Place in src/app/api/
- Use Zod for request validation
- Use Supabase service role for DB operations
- Return proper HTTP status codes
- Handle all error cases

.claude/commands/add-admin-page.md:
# Add Admin Page
Create a new admin dashboard page.
- Place in src/app/[locale]/(admin)/
- Protect with Supabase auth middleware
- Use admin layout with sidebar
- Add proper loading and empty states
- Include breadcrumb navigation

5. Create .env.local with all environment variable keys (empty values) and a .env.example with the same.

6. Create a comprehensive .gitignore appropriate for Next.js + Supabase.

7. Initialize a git repository, make the first commit with message "chore: initial project setup with CLAUDE.md and project structure"

After completing all of this, show me the full directory tree so I can verify the structure.