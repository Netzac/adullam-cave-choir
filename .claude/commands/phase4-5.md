Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on event management pages.

1. Create src/app/[locale]/(admin)/events/page.tsx:
   - List of all events in card or table layout
   - Status badges: Upcoming, Ongoing, Cancelled, Past
   - Create New Event button
   - Edit and Cancel actions per event

2. Create src/app/[locale]/(admin)/events/new/page.tsx:
   - Event creation form with all fields:
     Title, Description (textarea), Target Audience,
     Date, Time, Venue, Capacity, Fee (GHS), 
     Is Online toggle, Status
   - react-hook-form + zod validation
   - Save to Supabase on submit
   - Redirect to /events on success

3. Create src/app/[locale]/(admin)/events/[id]/page.tsx:
   - Event details
   - Edit form (same as create, pre-filled)
   - List of applicants for this event in a table
   - Cancel event button with confirmation dialog

When done run npm run typecheck and fix any errors.