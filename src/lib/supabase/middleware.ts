import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Refresh the Supabase auth session on the edge so server components see a
 * valid user. Returns the response so it can be composed with other middleware
 * (e.g. next-intl) without losing the refreshed cookies. Also returns the
 * authenticated user (or null) so callers can gate routes.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse = NextResponse.next({ request })
): Promise<{ response: NextResponse; user: User | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return { response, user: null };

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
