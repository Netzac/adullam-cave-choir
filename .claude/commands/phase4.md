Build the complete admin dashboard for Adullam Cave Choir. The dashboard is accessible only to authenticated admins via Supabase Auth.

## Auth Setup
1. Create src/app/[locale]/(admin)/login/page.tsx:
   - Elegant login page with choir branding
   - Email + password form
   - Supabase Auth sign in
   - Redirect to /admin/dashboard on success
   - No public registration link

2. Create middleware protection for all /admin routes

## Admin Layout
3. Create src/components/admin/AdminLayout.tsx:
   - Dark sidebar (collapsible on mobile)
   - Logo and "Admin Panel" label
   - Navigation: Dashboard, Applications, Events, Gallery, Blog, Equipment, Donations, Notifications, Settings
   - Notification bell with unread count (Supabase Realtime)
   - Admin avatar and name
   - Logout button

## Dashboard Home (src/app/[locale]/(admin)/dashboard/page.tsx)
4. Stats cards: Total Applications, Pending Review, Upcoming Events, Gallery Items, Total Donations
5. Recent applications table (last 5)
6. Upcoming events list
7. Recent notifications feed
8. Quick action buttons: New Event, View Applications, Upload Media

## Application Management
9. /admin/applications — paginated table with:
   - Columns: Name, Age, Program, Status badge, Date, Actions
   - Filter by: status, program, date range
   - Search by name or email
   - Click row to open detail drawer
   - Detail drawer: full application info, passport photo, status dropdown, internal notes textarea, save button
   - Export to CSV button
   - Status options: Received, Under Review, Admitted, Rejected, Waitlisted

## Event Management
10. /admin/events — list of all events with create/edit/cancel
11. Event form: all fields, rich text description, capacity, fee in GHS
12. /admin/events/[id] — event detail with list of applicants

## Gallery Management
13. /admin/gallery — grid view of all media items
14. Upload form: drag and drop photos, YouTube URL input for videos
15. Edit item: title, description, category, featured toggle, publish toggle
16. Bulk actions: publish, unpublish, delete

## Blog Management
17. /admin/blog — list of posts
18. Post editor with rich text (use a simple textarea for now, upgrade to Tiptap later)
19. Publish/unpublish toggle

## Equipment Records
20. /admin/equipment — list of installation records
21. Create/edit form: church name, location, date, equipment types, notes
22. Link gallery items to equipment records

## Donations
23. /admin/donations — table of all donations with amounts and status

## Notifications
24. /admin/notifications — full list, mark all as read
25. Real-time updates via Supabase Realtime subscriptions

## Settings
26. /admin/settings — update site settings stored in site_settings table:
    - Social media URLs
    - Contact information
    - About page text
    - How to Apply text

Show me the complete admin file tree when done.