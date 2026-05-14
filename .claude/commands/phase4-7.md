Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on blog and equipment management pages.

## Blog Management
1. Create src/app/[locale]/(admin)/blog/page.tsx:
   - List of all blog posts
   - Columns: Title, Status, Published Date, Actions
   - Create New Post button
   - Publish/unpublish toggle per post

2. Create src/app/[locale]/(admin)/blog/new/page.tsx:
   - Post creation form:
     Title, Slug (auto-generated from title), 
     Excerpt, Content (textarea for now),
     Cover Image upload, Published toggle
   - react-hook-form + zod validation
   - Save to blog_posts table

3. Create src/app/[locale]/(admin)/blog/[id]/page.tsx:
   - Edit existing post (pre-filled form)
   - Delete post with confirmation

## Equipment Records
4. Create src/app/[locale]/(admin)/equipment/page.tsx:
   - List of all installation records
   - Create New Record button

5. Create src/app/[locale]/(admin)/equipment/new/page.tsx:
   - Form: Church Name, Location, Service Date, 
     Equipment Types (multi-select), Notes, Status
   - Link related gallery items (multi-select from gallery)
   - Save to equipment_records table

6. Create src/app/[locale]/(admin)/equipment/[id]/page.tsx:
   - Edit record form (pre-filled)
   - Show linked gallery photos

When done run npm run typecheck and fix any errors.