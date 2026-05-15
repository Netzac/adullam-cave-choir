Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on the admin dashboard home page.

Create src/app/[locale]/(admin)/dashboard/page.tsx:

1. Stats cards row (fetch from Supabase):
   - Total Applications
   - Pending Review (status = 'received' or 'under_review')
   - Upcoming Events (date >= today)
   - Gallery Items (published)
   - Total Donations (sum in GHS)
   Each card: icon, number, label, subtle trend indicator

2. Recent Applications table (last 5):
   - Columns: Name, Program, Status badge, Date
   - "View All" link to /applications

3. Upcoming Events list (next 3):
   - Title, date, venue, capacity
   - "View All" link to /events

4. Quick action buttons:
   - New Event → /events/new
   - View Applications → /applications
   - Upload Media → /gallery/upload

5. Recent Notifications feed (last 5):
   - Icon, message, time ago
   - "View All" link to /notifications

Use loading skeletons for all data sections.
Handle empty states gracefully.

When done run npm run typecheck and fix any errors.