import MainLayout from '@/components/MainLayout';
import RepositoryMasonry from '@/components/RepositoryMasonry';
import { getProjectImage, projects } from '@/lib/projects';
import { headers } from 'next/headers';

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
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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
  const repositoryProjects = projects.map((project) => {
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
      <article className='mt-6 flex flex-col gap-4 sm:mt-8'>
        <p className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'>
          Bast Repository is a growing collection of participatory art projects
          that have taken place in Iran. Each project/work is presented through
          multiple layers of documentation, including basic information,
          archival materials, and conversations with the artists. In some cases,
          projects are further expanded through a commissioned re-reading
          written by another practitioner, researcher, or cultural worker. These
          additional perspectives open space for interpretation, critique, and
          reflection, allowing the projects to be revisited from different
          positions.
        </p>
        <p className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'>
          The repository does not aim to establish a definitive history of
          participatory art in Iran. Instead, it brings together diverse
          examples that reflect the variety of ways participation has been
          practiced across artistic, social, and spatial contexts. Many of the
          projects included respond to specific constraints, conditions, and
          urgencies, and reveal different approaches to collaboration,
          engagement, and collective action.
        </p>
        <p className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'>
          As the platform develops, new projects, materials, and re-readings may
          be added, allowing the repository to grow over time and remain open to
          further contributions and interpretations. You are invited to suggest a
          participatory art project here.
        </p>
      </article>

      {searchQuery && (
        <p className='mt-8 text-base leading-6 text-[#4f4a43]'>
          {filteredProjects.length} result
          {filteredProjects.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
        </p>
      )}

      <RepositoryMasonry projects={visibleProjects} layoutSeed={layoutSeed} />
    </MainLayout>
  );
}
