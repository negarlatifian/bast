import MainLayout from '@/components/MainLayout';
import RepositoryView from '@/components/RepositoryView';
import {
  getProjectImage,
  getProjectPreviewText,
  localizeProject,
  projects,
} from '@/lib/projects';
import { getDictionary } from '@/lib/dictionaries';
import { formatLocaleNumber, isLocale, localizeHref } from '@/lib/i18n';
import { headers } from 'next/headers';
import Link from 'next/link';
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

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const { q } = await searchParams;
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
      previewText: getProjectPreviewText(project),
      searchText: [title, artists.join(' '), location, year, sectionText, processText]
        .join(' ')
        .toLowerCase(),
      imageAlt: basicInformation['Featured Project Image'].alt || title,
      imageSrc: getProjectImage(project),
    };
  });
  const layoutSeed = getSeedFromRequestHeader(seedSource);
  const filteredProjects = searchQuery
    ? repositoryProjects.filter((project) =>
        project.searchText.includes(searchQuery)
      )
    : repositoryProjects;
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
        <Link
          href={localizeHref(lang, '/suggest-a-project')}
          className='mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium leading-6 text-[#7f242a] transition-colors hover:text-black sm:text-[1.08rem] sm:leading-7'
        >
          {dict.repository.suggestProject}
          <span aria-hidden='true'>{lang === 'fa' ? '←' : '→'}</span>
        </Link>
      </article>

      {searchQuery && (
        <p className='mt-8 text-sm leading-6 text-[#4f4a43]'>
          {formatLocaleNumber(filteredProjects.length, lang)}{' '}
          {filteredProjects.length === 1
            ? dict.search.resultsFor
            : dict.search.resultsForPlural}{' '}
          &ldquo;{q}&rdquo;
        </p>
      )}

      <RepositoryView projects={visibleProjects} layoutSeed={layoutSeed} />
    </MainLayout>
  );
}
