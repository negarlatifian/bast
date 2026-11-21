import type { MetadataRoute } from 'next';

import {
  getProjectReReadings,
  getReReadingLanguages,
  getReReadingPath,
} from '@/data/rereading';
import type { Locale } from '@/lib/i18n';
import { locales } from '@/lib/i18n';
import { projects } from '@/lib/projects';
import { languageAlternates, siteUrl } from '@/lib/seo';

const staticPaths = [
  '/',
  '/repository',
  '/readings',
  '/library-page',
  '/map',
  '/aboutbast',
  '/suggest-a-resource',
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Each path with the languages it exists in; a re-reading can be limited
  // to some of them.
  const entries: [string, readonly Locale[]][] = [
    ...staticPaths.map((path) => [path, locales] as [string, readonly Locale[]]),
    ...projects.map(
      (project) =>
        [`/repository/${project.slug}`, locales] as [string, readonly Locale[]],
    ),
    ...getProjectReReadings().map(
      (reReading) =>
        [
          `/readings/${getReReadingPath(reReading)}`,
          getReReadingLanguages(reReading),
        ] as [string, readonly Locale[]],
    ),
  ];

  return entries.flatMap(([path, pathLocales]) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path))
        .filter(
          ([locale]) =>
            locale === 'x-default' || pathLocales.includes(locale as Locale),
        )
        .map(([locale, href]) => [locale, `${siteUrl}${href}`]),
    );

    return pathLocales.map((locale) => ({
      url: languages[locale],
      alternates: { languages },
    }));
  });
}
