Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on authentication. Do not touch any other files.

1. Create src/app/[locale]/(admin)/login/page.tsx:
   - Elegant login page with choir branding (purple/gold)
   - Email + password form using react-hook-form + zod
   - Supabase Auth sign in
   - Redirect to /dashboard on success
   - Show error message on failed login
   - No public registration link
   - Responsive, centered card layout

2. Create middleware protection:
   - Update middleware.ts to protect all /* routes
   - Redirect unauthenticated users to /login
   - Allow /login through without auth check

When done run npm run typecheck and fix any errors.