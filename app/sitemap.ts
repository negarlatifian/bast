import type { MetadataRoute } from 'next';

import { getProjectReReadings } from '@/data/rereading';
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
  const paths = [
    ...staticPaths,
    ...projects.map((project) => `/repository/${project.slug}`),
    ...getProjectReReadings().map((reReading) => `/readings/${reReading.slug}`),
  ];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([locale, href]) => [
        locale,
        `${siteUrl}${href}`,
      ]),
    );

    return locales.map((locale) => ({
      url: languages[locale],
      alternates: { languages },
    }));
  });
}
