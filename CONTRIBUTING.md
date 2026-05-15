# Contributing to Adullam Cave Choir

Thank you for helping build this ministry platform. Please follow these standards so the codebase stays consistent and maintainable.

## Code standards

- **TypeScript:** Strict types only — never use `any`.
- **Components:** Named exports (no default exports for components).
- **Naming:** PascalCase for components (`HeroSection.tsx`), camelCase for utilities (`formatDate.ts`).
- **Server vs client:** Use Server Components by default; add `"use client"` only when needed (hooks, browser APIs, interactivity).
- **Forms:** `react-hook-form` + Zod validation for all forms.
- **Data:** Database access through `src/lib/supabase/` helpers — no inline Supabase calls in pages.
- **i18n:** All user-facing strings via `useTranslations()` / `getTranslations()` — no hardcoded copy in components.
- **States:** Handle loading, error, and empty states on every data-driven view.
- **Responsive:** Mobile-first; verify at 375px, 768px, and 1280px.
- **Animations:** Framer Motion — subtle and purposeful.

## Brand

- Primary: Purple `#6B21A8`, Gold `#D97706`, Accent Crimson `#8B1A1A`
- Dark background: `#0F0A1E`
- Typography: Playfair Display (headings), Inter (body)

## Pull requests

1. Branch from `main` with a descriptive name (`feat/gallery-filters`, `fix/admin-login`).
2. Run `npm run lint` and `npm run build` before opening a PR.
3. Keep PRs focused — one feature or fix per PR when possible.
4. Update `en.json` and `fr.json` together for any new copy.

## Commits

Use clear, imperative messages:

- `feat: add event registration form`
- `fix: correct admin gallery upload validation`
- `docs: update environment variable table`

## Questions

Open an issue or contact the project maintainers before large architectural changes.
