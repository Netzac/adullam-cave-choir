import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intl = createIntlMiddleware(routing);

const ADMIN_LOGIN_SEGMENT = '/admin/login';

function parseAdminPath(pathname: string): { isAdmin: boolean; isLogin: boolean; locale: string } {
  const segments = pathname.split('/').filter(Boolean);
  let locale = routing.defaultLocale as string;
  let rest = segments;

  if (segments.length > 0 && (routing.locales as readonly string[]).includes(segments[0])) {
    locale = segments[0];
    rest = segments.slice(1);
  }

  const isAdmin = rest[0] === 'admin';
  const isLogin = isAdmin && rest[1] === 'login';
  return { isAdmin, isLogin, locale };
}

export default async function middleware(request: NextRequest) {
  const intlResponse = intl(request);
  const { response, user } = await updateSession(request, intlResponse);

  const { isAdmin, isLogin, locale } = parseAdminPath(request.nextUrl.pathname);

  if (isAdmin && !isLogin && !user) {
    const url = request.nextUrl.clone();
    const loginPath =
      locale === routing.defaultLocale ? ADMIN_LOGIN_SEGMENT : `/${locale}${ADMIN_LOGIN_SEGMENT}`;
    url.pathname = loginPath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
