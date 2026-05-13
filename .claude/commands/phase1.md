Set up the complete design system for Adullam Cave Choir:

1. Configure tailwind.config.ts with:
   - Custom colors: purple (#6B21A8, shades 50-950), gold (#D97706, shades), crimson (#8B1A1A), dark (#0F0A1E)
   - Custom fonts: Playfair Display (headings), Inter (body)
   - Custom animations: fadeIn, slideUp, slideIn, shimmer
   - Custom shadows and border radius values

2. Update src/styles/globals.css with:
   - CSS custom properties for all brand colors
   - Dark mode variables
   - Custom scrollbar styling (thin, purple-tinted)
   - Base typography styles
   - Smooth scroll behavior

3. Add Google Fonts to src/app/layout.tsx:
   - Playfair Display (400, 600, 700, 900)
   - Inter (300, 400, 500, 600, 700)

4. Create src/lib/utils.ts with cn() utility using clsx + tailwind-merge

5. Create src/config/site.ts with:
   - Site name, description, URL
   - Social media links (Facebook, Instagram, YouTube, TikTok, X) as placeholders
   - Contact info placeholders (email, phone, address in Accra Ghana)
   - Navigation links for public site

6. Initialize Shadcn/UI with the purple brand color as the primary color.
   Install these shadcn components:
   button, card, input, textarea, select, form, dialog, sheet, 
   dropdown-menu, navigation-menu, badge, avatar, separator, 
   skeleton, toast, sonner, tabs, accordion, table, progress

7. Create src/components/layout/Navbar.tsx:
   - Sticky, glassmorphism effect on scroll
   - Adullam Cave Choir logo (text-based placeholder until logo image is added)
   - Navigation links: Home, About, Programs, Workshops, Gallery, Equipment, Contact
   - "Apply Now" CTA button in gold
   - Language switcher (EN/FR)
   - Dark/light mode toggle
   - Mobile hamburger menu with smooth slide-out drawer
   - Framer Motion animations on mount and scroll

8. Create src/components/layout/Footer.tsx:
   - Dark background (#0F0A1E)
   - Logo and tagline "from the Cave to the Stage"
   - Navigation columns: Quick Links, Programs, Services, Connect
   - Social media icons with hover animations
   - Contact info (Accra, Ghana)
   - Copyright notice
   - Subtle gold divider lines

9. Create src/components/layout/RootLayout.tsx wrapping Navbar + children + Footer with:
   - Framer Motion page transition wrapper
   - next-themes ThemeProvider
   - Sonner toast provider

10. Set up next-intl:
    - Create src/i18n/en.json and src/i18n/fr.json with keys for all navigation items, CTAs, and common UI text
    - Create src/i18n/routing.ts with locales ['en', 'fr'] and defaultLocale 'en'
    - Create middleware.ts for locale routing
    - Create src/i18n/request.ts

After completing, show me the Navbar and Footer rendered structure.