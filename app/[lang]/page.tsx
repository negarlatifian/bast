import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

import HomeTriptychShuffle, {
  type TriptychPanelText,
} from '@/components/HomeTriptychShuffle';
import MainLayout from '@/components/MainLayout';
import { getProjectReReadings, getReReadingPath } from '@/data/rereading';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref, type Locale } from '@/lib/i18n';
import { getProjectImage, localizeProject, projects } from '@/lib/projects';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dict = getDictionary(lang);

  return pageMetadata({
    lang,
    path: '/',
    description: dict.home.heroTitle,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  // Prerendered once per language and served from the CDN; the images and
  // arrangement are drawn per visit in the browser by HomeTriptychShuffle.
  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const sections = dict.home.sections;

  const withImages = projects
    .map((rawProject) => {
      const project = localizeProject(rawProject, locale);
      const basicInformation = project['1. Basic Information'];
      const title = basicInformation['Project Title'];

      return {
        slug: project.slug,
        title,
        alt: basicInformation['Featured Project Image'].alt || title,
        src: getProjectImage(project),
      };
    })
    .filter((project) => project.src !== '/under-construction.webp');

  // One re-reading per project (the same pick as before when it has several).
  const reReadingPaths: [string, string][] = Array.from(
    new Map(
      getProjectReReadings(locale)
        .reverse()
        .map((reReading) => [reReading.slug, getReReadingPath(reReading)])
    )
  );

  const panels: TriptychPanelText[] = [
    {
      key: 'about',
      eyebrow: sections.about.eyebrow,
      title: sections.about.title,
      description: dict.home.heroTitle,
      href: localizeHref(locale, '/aboutbast'),
      linkLabel: sections.about.viewAll,
    },
    {
      key: 'repository',
      eyebrow: sections.repository.eyebrow,
      title: sections.repository.title,
      description: sections.repository.description,
      href: localizeHref(locale, '/repository'),
      linkLabel: sections.repository.viewAll,
    },
    {
      key: 'rereading',
      eyebrow: sections.rereading.eyebrow,
      title: sections.rereading.title,
      description: sections.rereading.description,
      href: localizeHref(locale, '/readings'),
      linkLabel: sections.rereading.viewAll,
    },
  ];

  return (
    <MainLayout navigation='plus'>
      <section className='flex flex-col gap-4 pt-1 pb-10 sm:gap-6 lg:min-h-0 lg:flex-1 lg:pb-8'>
        <HomeTriptychShuffle
          panels={panels}
          projects={withImages}
          reReadingPaths={reReadingPaths}
        />
      </section>
    </MainLayout>
  );
}
