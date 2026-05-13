Set up the complete Supabase database schema and client configuration for Adullam Cave Choir:

1. Create src/lib/supabase/client.ts — browser client
2. Create src/lib/supabase/server.ts — server client using SSR
3. Create src/lib/supabase/middleware.ts — auth session refresh
4. Update middleware.ts to handle both next-intl and Supabase auth

5. Create src/types/database.ts with TypeScript interfaces for all tables:

Tables to define:
- profiles (id, email, full_name, role, avatar_url, created_at)
- applications (id, full_name, age, phone, email, interest_level, experience, preferred_program, guardian_consent, notes, passport_photo_url, status, internal_notes, created_at, updated_at)
- programs (id, title, description, target_audience, duration, format, prerequisites, is_active, created_at)
- events (id, title, description, audience, date, time, venue, capacity, fee, currency, is_online, status, created_at)
- event_applications (id, event_id, full_name, organization, email, phone, message, status, created_at)
- gallery_items (id, title, description, category, media_type, file_url, thumbnail_url, youtube_url, is_featured, is_published, date_taken, created_at)
- equipment_records (id, church_name, location, service_date, equipment_types, notes, status, created_at)
- equipment_gallery (id, equipment_record_id, gallery_item_id)
- donations (id, donor_name, email, phone, amount, currency, message, payment_reference, status, created_at)
- blog_posts (id, title, slug, content, excerpt, cover_image_url, is_published, published_at, author_id, created_at)
- notifications (id, title, message, type, is_read, related_id, related_type, created_at)
- site_settings (id, key, value, updated_at)

6. Create src/lib/supabase/schema.sql with the complete SQL to create all tables, with:
   - Proper foreign keys and indexes
   - Row Level Security (RLS) policies:
     - Public can read published gallery items, programs, events, blog posts
     - Public can insert applications, event_applications, donations
     - Only authenticated admins can do everything else
   - Updated_at triggers
   - Storage buckets: 'gallery', 'avatars', 'applications'

7. Create src/lib/supabase/queries/ folder with helper files:
   - applications.ts (getAll, getById, updateStatus, create)
   - events.ts (getAll, getUpcoming, getById, create, update)
   - gallery.ts (getAll, getFeatured, getByCategory, create, update)
   - blog.ts (getAll, getPublished, getBySlug, create, update)
   - equipment.ts (getAll, getById, create, update)
   - donations.ts (create, getAll)
   - notifications.ts (getUnread, markAsRead, create)

8. Create src/lib/validations/ with Zod schemas:
   - applicationSchema.ts
   - eventApplicationSchema.ts
   - donationSchema.ts
   - contactSchema.ts
   - blogPostSchema.ts

Show me the complete schema.sql when done.