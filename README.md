# Adullam Cave Choir

**from the Cave to the Stage** — A music-choir web application for Adullam Cave Choir in Accra, Ghana. The platform showcases programs, events, gallery, and equipment services, and accepts chorister applications and donations.

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database / Auth / Storage:** Supabase
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **i18n:** next-intl (English + French)
- **Payments:** Paystack
- **Email:** Resend
- **Deployment:** Vercel

## Local setup

```bash
git clone <repository-url>
cd Gloria
npm install
cp .env.example .env.local   # if present; otherwise create .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (Phase 3) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token (Phase 3) |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender (Phase 3) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://adullamcavechoir.org`) |

## Phase roadmap

| Phase | Scope | Status |
|-------|--------|--------|
| **1** | Public frontend, i18n, SEO, polish | In progress |
| **2** | Admin dashboard | Built |
| **3** | Paystack, WhatsApp automation, advanced features | Planned |

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Deployment (Vercel)

1. Import the repository in [Vercel](https://vercel.com).
2. Set all environment variables from the table above.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Deploy — `vercel.json` configures security headers and the `cdg1` region.

Admin routes live under `/admin/*` and require Supabase Auth.

## Project structure

```
src/
  app/           # Next.js App Router (public, admin, API)
  components/    # UI, layout, sections, admin, seo
  config/        # Site configuration
  hooks/         # React hooks
  i18n/          # Translations (en, fr) and routing
  lib/           # Supabase, validations, SEO, email
  types/         # TypeScript types
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for coding standards.
