Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on the admin settings page.

Create src/app/[locale]/(admin)/settings/page.tsx:
- Tabbed layout with these tabs:
  General, Social Media, Contact Info, Content

Tab 1 - General:
  - Site name, tagline
  - Admin email for notifications

Tab 2 - Social Media:
  - Input fields for: Facebook URL, Instagram URL, 
    YouTube URL, TikTok URL, X/Twitter URL
  - WhatsApp number for notifications

Tab 3 - Contact Info:
  - Organization address (Accra, Ghana)
  - Phone number
  - Email address
  - Google Maps embed URL

Tab 4 - Content:
  - About page intro text (textarea)
  - How to Apply text (textarea)
  - Homepage tagline override

- All settings saved to site_settings table in Supabase
  using key/value pairs
- Save button per tab
- Show success toast on save
- Load existing values on page mount

When done run npm run typecheck and fix any errors.