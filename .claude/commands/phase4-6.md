Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on gallery management pages.

1. Create src/app/[locale]/(admin)/gallery/page.tsx:
   - Grid view of all media items (photos and videos)
   - Filter by category: All, Programs, Installations, Events
   - Each item shows: thumbnail, title, category badge, 
     published status, featured badge
   - Bulk action bar: select multiple → publish, unpublish, delete
   - Upload New button

2. Create src/app/[locale]/(admin)/gallery/upload/page.tsx:
   - Drag and drop photo upload area (uploads to Supabase Storage 'gallery' bucket)
   - YouTube/Vimeo URL input for video embeds
   - Fields: Title, Description, Category dropdown, Date Taken
   - Featured toggle, Published toggle
   - Save to gallery_items table on submit

3. Create src/components/admin/GalleryItemEditDialog.tsx:
   - Dialog for editing existing gallery items
   - Edit: title, description, category, featured, published
   - Delete button with confirmation

When done run npm run typecheck and fix any errors.