// Shared i18n config — safe to import from both server and client components.

export const locales = ['en', 'fa'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Right-to-left locales. Farsi is RTL; English is LTR.
const rtlLocales: readonly Locale[] = ['fa'];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

// Human-readable name of each locale, shown in the language switcher.
export const localeNames: Record<Locale, string> = {
  en: 'EN',
  fa: 'فا',
};

/**
 * Prefix an internal href with the active locale.
 * External links, mailto:, tel: and in-page anchors are returned untouched.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (/^([a-z]+:|\/\/|#)/i.test(href)) {
    return href;
  }

  if (href === '/') {
    return `/${locale}`;
  }

  const normalized = href.startsWith('/') ? href : `/${href}`;
  return `/${locale}${normalized}`;
}

/**
 * Swap the locale segment of a pathname, preserving the rest of the path.
 * Used by the language switcher. `/en/repository` -> `/fa/repository`.
 */
export function switchLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split('/');
  // segments[0] is '' (leading slash), segments[1] is the locale.
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join('/') || `/${nextLocale}`;
  }
  return `/${nextLocale}${pathname}`;
}

const numberFormatters: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US', { useGrouping: false }),
  fa: new Intl.NumberFormat('fa-IR', { useGrouping: false }),
};

/**
 * Renders a plain number (a year, a count) in the active locale's digits —
 * Persian numerals for Farsi, Western Arabic numerals for English. Use this
 * anywhere a raw number is interpolated into UI text; localized strings that
 * already come from data (e.g. a project's own Farsi "Year / Time Period"
 * text) already carry the right digits and don't need this.
 */
export function formatLocaleNumber(value: number, locale: Locale): string {
  return numberFormatters[locale].format(value);
}
