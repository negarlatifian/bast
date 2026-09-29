import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import HomeTriptych, {
  type TriptychFrame,
  type TriptychPanel,
} from '@/components/HomeTriptych';
import MainLayout from '@/components/MainLayout';
import { getProjectReReadings } from '@/data/rereading';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref, type Locale } from '@/lib/i18n';
import { getProjectImage, localizeProject, projects } from '@/lib/projects';

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

const FRAME_ASPECTS: TriptychFrame['aspect'][] = ['4/5', '1/1', '5/4'];

function jitter(slot: number) {
  return Math.min(1, Math.max(0, slot + randomBetween(-0.12, 0.12)));
}

// Loose placements for the three columns' frames — the collage fits each to
// its column's actual space. Every frame takes a different height (high,
// middle, low) and a different side (start, centre, end), shuffled per
// visit, so the three never line up into a grid.
function randomFrames(): TriptychFrame[] {
  const slots = [0, 0.5, 1];
  const ySlots = shuffle(slots);
  const xSlots = shuffle(slots);

  return slots.map((_, index) => ({
    aspect: FRAME_ASPECTS[Math.floor(Math.random() * FRAME_ASPECTS.length)],
    size: Math.random(),
    x: jitter(xSlots[index]),
    y: jitter(ySlots[index]),
  }));
}

// Each column's text takes a different height too — one high, one centred,
// one low — with the odd block nudged in from the edge.
function randomTextLayouts(): Pick<
  TriptychPanel,
  'textPosition' | 'textIndent'
>[] {
  return shuffle<TriptychPanel['textPosition']>(['top', 'middle', 'bottom']).map(
    (textPosition) => ({ textPosition, textIndent: Math.random() < 0.35 })
  );
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

  // Render per request so each visit draws a new set of project images.
  await connection();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const sections = dict.home.sections;

  const withImages = shuffle(
    projects
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
      .filter((project) => project.src !== '/under-construction.webp')
  );

  // The re-reading column shows a project that actually has a re-reading,
  // and its frame opens that essay; the other two open the project entry.
  const reReadingSlugs = new Set(
    getProjectReReadings().map((reReading) => reReading.slug)
  );
  const readingProject =
    withImages.find((project) => reReadingSlugs.has(project.slug)) ??
    withImages[0];
  const [repositoryProject, libraryProject] = withImages.filter(
    (project) => project !== readingProject
  );

  const toImage = (
    project: (typeof withImages)[number] | undefined,
    href: string
  ): TriptychPanel['image'] =>
    project
      ? { src: project.src, alt: project.alt, caption: project.title, href }
      : {
          src: '/under-construction.webp',
          alt: '',
          caption: '',
          href,
        };

  const frames = randomFrames();
  const textLayouts = randomTextLayouts();
  const panels: TriptychPanel[] = [
    {
      key: 'repository',
      eyebrow: sections.repository.eyebrow,
      title: sections.repository.title,
      description: sections.repository.description,
      href: localizeHref(locale, '/repository'),
      linkLabel: sections.repository.viewAll,
      image: toImage(
        repositoryProject,
        localizeHref(locale, `/repository/${repositoryProject?.slug ?? ''}`)
      ),
      frame: frames[0],
      ...textLayouts[0],
    },
    {
      key: 'rereading',
      eyebrow: sections.rereading.eyebrow,
      title: sections.rereading.title,
      description: sections.rereading.description,
      href: localizeHref(locale, '/readings'),
      linkLabel: sections.rereading.viewAll,
      image: toImage(
        readingProject,
        reReadingSlugs.has(readingProject?.slug ?? '')
          ? localizeHref(locale, `/readings/${readingProject.slug}`)
          : localizeHref(locale, `/repository/${readingProject?.slug ?? ''}`)
      ),
      frame: frames[1],
      ...textLayouts[1],
    },
    {
      key: 'library',
      eyebrow: sections.library.eyebrow,
      title: sections.library.title,
      description: sections.library.description,
      href: localizeHref(locale, '/library-page'),
      linkLabel: sections.library.viewAll,
      image: toImage(
        libraryProject,
        localizeHref(locale, `/repository/${libraryProject?.slug ?? ''}`)
      ),
      frame: frames[2],
      ...textLayouts[2],
    },
  ];

  return (
    <MainLayout navigation='plus'>
      <section className='flex flex-col gap-4 pt-1 pb-10 sm:gap-6 lg:min-h-0 lg:flex-1 lg:pb-8'>
        <h1 className='relative text-base leading-snug font-semibold text-black sm:text-xl lg:text-[clamp(1.25rem,1.8vw,1.9rem)] lg:[@media(max-height:560px)]:hidden'>
          {/* The line spans the collage's full width (its text wraps
              narrower) so the reversed copy's clip lines up with the
              strips in either reading direction. */}
          <span className='block max-w-4xl'>{dict.home.heroTitle}</span>
          {/* A white copy, clipped to whichever full-page photo strip is
              showing, so the line reads across both photo and paper. */}
          <span aria-hidden='true' className='home-intro-reverse'>
            <span className='block max-w-4xl'>{dict.home.heroTitle}</span>
          </span>
        </h1>
        <HomeTriptych panels={panels} />
      </section>
    </MainLayout>
  );
}
