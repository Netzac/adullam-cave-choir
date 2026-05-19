Read CLAUDE.md for full project context.

Find every hardcoded static data array inside components (team, programs, events, gallery, equipment, testimonials, stats). Replace each with a real Supabase query using the existing client in src/lib/supabase/. Use server components with async/await. Add TypeScript types. Handle empty states.

Run npm run typecheck after. List every file changed.