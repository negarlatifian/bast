import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import MainLayout from '@/components/MainLayout';
import RepositoryTagFilter from '@/components/RepositoryTagFilter';
import RepositoryView from '@/components/RepositoryView';
import {
  getProjectImage,
  getProjectPreviewText,
  localizeProject,
  projects,
} from '@/lib/projects';
import { getDictionary } from '@/lib/dictionaries';
import { getFormUrl } from '@/lib/forms';
import { formatLocaleNumber, isLocale } from '@/lib/i18n';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function shuffleProjects<T>(items: T[], seed: number) {
  const shuffledItems = [...items];
  let randomState = seed;

  const nextRandom = () => {
    randomState = (randomState * 1664525 + 1013904223) % 4294967296;
    return randomState / 4294967296;
  };

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(nextRandom() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function getSeedFromRequestHeader(value: string) {
  let seed = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    seed ^= value.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return seed >>> 0;
}

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

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; tag?: string | string[] }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const { q, tag } = await searchParams;
  const headersList = await headers();
  const seedSource = [
    headersList.get('x-vercel-id'),
    headersList.get('x-forwarded-for'),
    headersList.get('user-agent'),
    headersList.get('accept-language'),
    headersList.get('date'),
  ]
    .filter(Boolean)
    .join('|');
  const searchQuery = q?.trim().toLowerCase() ?? '';
  const selectedTags = Array.from(
    new Set(
      (Array.isArray(tag) ? tag : tag ? [tag] : [])
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
  const repositoryProjects = projects.map((rawProject) => {
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
  const layoutSeed = getSeedFromRequestHeader(seedSource);
  const filteredProjects = repositoryProjects.filter(
    (project) =>
      (!searchQuery || project.searchText.includes(searchQuery)) &&
      selectedTags.every((selected) => project.tags.includes(selected)),
  );
  const tagCounts = new Map<string, number>();
  for (const project of repositoryProjects) {
    for (const projectTag of project.tags) {
      tagCounts.set(projectTag, (tagCounts.get(projectTag) ?? 0) + 1);
    }
  }
  const sortedTags = Array.from(tagCounts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], lang),
  );
  const visibleProjects = shuffleProjects(filteredProjects, layoutSeed);

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

      <RepositoryTagFilter
        tags={sortedTags}
        selectedTags={selectedTags}
        searchQuery={q?.trim()}
      />

      {(searchQuery || selectedTags.length > 0) && (
        <p className='mt-8 text-sm leading-6 text-[#4f4a43]'>
          {formatLocaleNumber(filteredProjects.length, lang)}{' '}
          {filteredProjects.length === 1
            ? dict.search.resultsFor
            : dict.search.resultsForPlural}{' '}
          {searchQuery && <>&ldquo;{q}&rdquo;</>}
          {searchQuery && selectedTags.length > 0 && ' · '}
          {selectedTags.length > 0 && (
            <span className='font-extrabold tracking-wide text-[#7f242a] uppercase'>
              {selectedTags.join(' · ')}
            </span>
          )}
        </p>
      )}

      <RepositoryView projects={visibleProjects} layoutSeed={layoutSeed} />
    </MainLayout>
  );
}
