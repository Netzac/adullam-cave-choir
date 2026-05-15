Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on application management pages.

1. Create src/app/[locale]/(admin)/applications/page.tsx:
   - Paginated table (10 per page)
   - Columns: Name, Age, Program, Status badge, Date, Actions
   - Filter bar: status dropdown, program dropdown, date range picker
   - Search input: search by name or email
   - Export to CSV button (client-side export of filtered results)
   - Click row to open detail drawer

2. Create src/components/ApplicationDetailDrawer.tsx:
   - Slides in from right using Shadcn Sheet component
   - Full application details: all form fields
   - Passport photo display (if uploaded)
   - Status dropdown: Received, Under Review, Admitted, Rejected, Waitlisted
   - Internal notes textarea
   - Save Changes button (updates Supabase)
   - Close button

3. Status badge colors:
   - Received: blue
   - Under Review: yellow
   - Admitted: green
   - Rejected: red
   - Waitlisted: purple

When done run npm run typecheck and fix any errors.