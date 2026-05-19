Read CLAUDE.md for full project context.

All /blog routes are returning 404. Diagnose and fix the issue completely:

1. DIAGNOSE
   - Check src/app/[locale]/ for a blog/ folder and its route files
   - Check if blog pages exist: blog/page.tsx, blog/[slug]/page.tsx
   - Check all navbar/footer links pointing to /blog or /blog/[slug]
   - Check messages/en.json for blog navigation keys
   - Check if there is a blog table in Supabase being queried

2. IF BLOG PAGES ARE MISSING
   - Create src/app/[locale]/blog/page.tsx — blog listing page
     - Fetch posts from Supabase `blog_posts` table (id, title, slug, excerpt, cover_image, published_at, author)
     - Show posts in a grid with title, excerpt, date, cover image
     - Handle empty state gracefully
     - Match the existing dark theme and design system
   
   - Create src/app/[locale]/blog/[slug]/page.tsx — individual post page
     - Fetch single post by slug from Supabase
     - Render full post content
     - Add generateStaticParams if using static generation
     - Return notFound() if slug doesn't exist in database
     - Match existing dark theme and design system

3. IF BLOG PAGES EXIST BUT ARE BROKEN
   - Fix the routing issue (wrong folder structure, missing layout, locale mismatch)
   - Fix any broken Supabase queries
   - Fix any TypeScript errors

4. VERIFY LINKS
   - Make sure all navbar and footer /blog links use the correct locale-aware href
   - Use next-intl's Link or useRouter for all blog navigation

Run npm run typecheck and npm run build after. Fix all errors until build passes cleanly. List every file created or changed.