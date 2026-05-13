Complete the internationalization, SEO, and final polish for Adullam Cave Choir:

## Internationalization
1. Complete src/i18n/en.json and src/i18n/fr.json with ALL translation keys for:
   - Navigation items
   - All page headings and body text
   - Form labels, placeholders, and error messages
   - Button labels and CTAs
   - Email templates
   - Status labels
   - Footer content

2. Ensure every hardcoded string in every component uses useTranslations() hook

3. Add language switcher that persists preference in localStorage

## SEO
4. Create src/app/[locale]/layout.tsx with base metadata:
   - title template: "%s | Adullam Cave Choir"
   - description, keywords
   - Open Graph: title, description, image, locale
   - Twitter card
   - canonical URLs

5. Add unique metadata to each public page

6. Create src/app/sitemap.ts — dynamic sitemap including all published blog posts and events

7. Create src/app/robots.ts

8. Add JSON-LD structured data to:
   - Home page (Organization schema)
   - Events page (Event schema)
   - Blog posts (Article schema)

## Performance & Polish
9. Add loading.tsx skeleton screens for all pages

10. Add error.tsx and not-found.tsx pages with branded design

11. Add page transition animations in root layout

12. Optimize all images with next/image

13. Create src/components/ui/PageHero.tsx — reusable hero component used across all pages

14. Final responsive audit — check all pages on mobile (375px), tablet (768px), desktop (1280px)

15. Add dark mode support to all components using next-themes

## Deployment Prep
16. Create vercel.json with proper configuration

17. Update README.md with:
    - Project overview
    - Tech stack
    - Local setup instructions
    - Environment variables guide
    - Phase roadmap
    - Deployment instructions

18. Create CONTRIBUTING.md with coding standards

19. Final git commit: "feat: complete Phase 1 public frontend"

Show me the final complete project file tree.