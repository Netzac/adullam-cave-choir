Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on donations management page.

Create src/app/[locale]/(admin)/donations/page.tsx:
- Table of all donations
- Columns: Donor Name, Email, Amount (GHS ₵), 
  Message, Payment Reference, Status badge, Date
- Status badges: Pending (yellow), Completed (green), Failed (red)
- Summary cards at top:
  Total Donations (GHS), Completed Count, Pending Count
- Filter by: status, date range
- Search by donor name or email
- Export to CSV button

When done run npm run typecheck and fix any errors.