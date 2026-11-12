import type { MetadataRoute } from 'next';

import { locales } from '@/lib/i18n';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Filtered and searched repository views (?tag=…, ?q=…) are endless
      // combinations of the same page; crawlers only need the plain one.
      disallow: locales.map((locale) => `/${locale}/repository?`),
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
