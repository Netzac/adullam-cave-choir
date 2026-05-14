Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on the admin layout. Do not touch auth or pages.

Create src/components/admin/AdminLayout.tsx:
- Dark sidebar with deep purple background (#0F0A1E)
- Collapsible on mobile (hamburger toggle)
- Logo and "Admin Panel" label at top
- Navigation links with icons:
  Dashboard, Applications, Events, Gallery, 
  Blog, Equipment, Donations, Notifications, Settings
- Active link highlighting in gold
- Notification bell with unread count badge (placeholder count for now)
- Admin avatar, name and email at bottom of sidebar
- Logout button using Supabase Auth signOut
- Main content area with proper padding
- Framer Motion sidebar animation on mobile

Create src/app/[locale]/(admin)/layout.tsx:
- Wrap all admin pages with AdminLayout
- Check for authenticated session
- Redirect to login if not authenticated

When done run npm run typecheck and fix any errors.