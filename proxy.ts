import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { defaultLocale, isLocale, locales } from '@/lib/i18n';

/**
 * Pick the best-matching supported locale from the Accept-Language header.
 * Minimal parser — avoids pulling in Negotiator / intl-localematcher deps.
 */
function getPreferredLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language');

  if (header) {
    const requested = header
      .split(',')
      .map((part) => {
        const [tag, quality] = part.trim().split(';q=');
        return {
          tag: tag.toLowerCase(),
          q: quality ? Number(quality) : 1,
        };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of requested) {
      const base = tag.split('-')[0];
      const match = locales.find((locale) => locale === base);
      if (match) {
        return match;
      }
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Does the path already start with a supported locale?
  const firstSegment = pathname.split('/')[1];
  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  // No locale in the path — redirect to the preferred (or default) locale.
  const locale = getPreferredLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Run on everything except Next internals, API routes, and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|images|fonts|favicon|.*\\.[\\w]+$).*)',
  ],
};
