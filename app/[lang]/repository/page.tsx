import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import MainLayout from '@/components/MainLayout';
import RepositoryBrowser, {
  RepositoryBrowserFallback,
  type RepositoryBrowserProject,
} from '@/components/RepositoryBrowser';
import {
  getProjectImage,
  getProjectPreviewText,
  localizeProject,
  projects,
} from '@/lib/projects';
import { getDictionary } from '@/lib/dictionaries';
import { getFormUrl } from '@/lib/forms';
import { isLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

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
    path: '/repository',
    title: dict.nav.repository,
    description: dict.home.sections.repository.description,
  });
}

// Prerendered per language and served from the CDN. Search (?q=), tag
// filters (?tag=) and the shuffled layout are applied in the browser by
// RepositoryBrowser, so no visit to this page runs server code.
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const repositoryProjects: RepositoryBrowserProject[] = projects.map((rawProject) => {
    const project = localizeProject(rawProject, lang);
    const basicInformation = project['1. Basic Information'];
    const title = basicInformation['Project Title'];
    const artists =
      basicInformation[
        'Artist / Group / Collective / Organizer / Supervisor / Initiator'
      ];
    const location = basicInformation.Location.text;
    const year = basicInformation['Year / Time Period'].text;
    const sectionText = project.sections
      .flatMap((section) => [section.title, ...section.paragraphs])
      .join(' ');
    const processText =
      project['Participation & Process']?.subsections
        ?.flatMap((subsection) => [
          subsection.title,
          ...subsection.paragraphs,
        ])
        .join(' ') ?? '';

    return {
      slug: project.slug,
      title,
      artists,
      tags: basicInformation['Thematic Tags'] ?? [],
      previewText: getProjectPreviewText(project),
      searchText: [title, artists.join(' '), location, year, sectionText, processText]
        .join(' ')
        .toLowerCase(),
      imageAlt: basicInformation['Featured Project Image'].alt || title,
      imageSrc: getProjectImage(project),
    };
  });
  const tagCounts = new Map<string, number>();
  for (const project of repositoryProjects) {
    for (const projectTag of project.tags) {
      tagCounts.set(projectTag, (tagCounts.get(projectTag) ?? 0) + 1);
    }
  }
  const sortedTags = Array.from(tagCounts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], lang),
  );

  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-3 sm:mt-8'>
        {dict.repository.intro.map((paragraph, index) => (
          <p
            key={`repository-intro-${index}`}
            className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'
          >
            {paragraph}
          </p>
        ))}
        <a
          href={getFormUrl(lang, '/suggest-a-project')}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium leading-6 text-[#7f242a] transition-colors hover:text-black sm:text-[1.08rem] sm:leading-7'
        >
          {dict.repository.suggestProject}
          <span aria-hidden='true'>{lang === 'fa' ? '←' : '→'}</span>
        </a>
      </article>

      <Suspense
        fallback={
          <RepositoryBrowserFallback
            projects={repositoryProjects}
            tags={sortedTags}
          />
        }
      >
        <RepositoryBrowser projects={repositoryProjects} tags={sortedTags} />
      </Suspense>
    </MainLayout>
  );
}
