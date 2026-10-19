import type { Metadata } from 'next';

import { locales, type Locale } from '@/lib/i18n';

export const siteUrl = 'https://www.bast.work';
export const siteName = 'Bast work';
export const siteDescription =
  'Bast is a research and curatorial platform dedicated to the study and documentation of participatory art in Iran.';
export const defaultOgImage = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: siteName,
};

const ogLocales: Record<Locale, string> = {
  en: 'en_US',
  fa: 'fa_IR',
};

/** Locale-prefixed path, e.g. ('fa', '/repository') -> '/fa/repository'. */
function localePath(locale: Locale, path: string) {
  return `/${locale}${path === '/' ? '' : path}`;
}

/** Each locale's version of a path, for hreflang links and the sitemap. */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, localePath(locale, path)]),
    ),
    'x-default': localePath('en', path),
  };
}

/** Trim text to a search-snippet length without cutting a word in half. */
export function toDescription(text: string, maxLength = 160) {
  const plain = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  const cut = plain.slice(0, maxLength - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '')}…`;
}

/**
 * Page metadata with a canonical URL, links to the other language and
 * matching Open Graph tags. `path` is the route without the locale prefix.
 */
export function pageMetadata({
  lang,
  path,
  title,
  description = siteDescription,
  image,
}: {
  lang: Locale;
  path: string;
  title?: string;
  description?: string;
  image?: string;
}): Metadata {
  const url = localePath(lang, path);
  const images = image
    ? [{ url: image, alt: title ?? siteName }]
    : [defaultOgImage];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      siteName,
      title: title ?? siteName,
      description,
      url,
      locale: ogLocales[lang],
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? siteName,
      description,
      images: images.map((item) => item.url),
    },
  };
}
