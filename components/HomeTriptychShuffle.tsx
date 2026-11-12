'use client';

import { useEffect, useMemo, useState } from 'react';

import { localizeHref } from '@/lib/i18n';

import HomeTriptych, {
  type TriptychFrame,
  type TriptychPanel,
} from './HomeTriptych';
import { useLocale } from './LocaleProvider';

export type TriptychProject = {
  slug: string;
  title: string;
  alt: string;
  src: string;
};

export type TriptychPanelText = Omit<
  TriptychPanel,
  'image' | 'frame' | 'textPosition'
>;

type HomeTriptychShuffleProps = {
  // [about, repository, rereading] — the fixed text of each column.
  panels: TriptychPanelText[];
  // Projects with a real featured image to draw the three frames from.
  projects: TriptychProject[];
  // Project slug → its newest re-reading's path, for the re-reading column.
  reReadingPaths: [string, string][];
};

const FRAME_ASPECTS: TriptychFrame['aspect'][] = ['4/5', '1/1', '5/4'];

// Small seeded generator, so the prerendered HTML and the first client render
// agree (seed 0) before the visit's own random seed takes over.
function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPanels(
  seed: number,
  { panels, projects, reReadingPaths }: HomeTriptychShuffleProps,
  lang: Parameters<typeof localizeHref>[0],
): TriptychPanel[] {
  const random = createRandom(seed);

  const shuffle = <T,>(items: T[]) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  };

  const jitter = (slot: number) =>
    Math.min(1, Math.max(0, slot + (random() * 0.24 - 0.12)));

  // Every frame takes a different height (high, middle, low) and a different
  // side (start, centre, end), so the three never line up into a grid.
  const slots = [0, 0.5, 1];
  const ySlots = shuffle(slots);
  const xSlots = shuffle(slots);
  const frames: TriptychFrame[] = slots.map((_, index) => ({
    aspect: FRAME_ASPECTS[Math.floor(random() * FRAME_ASPECTS.length)],
    size: random(),
    x: jitter(xSlots[index]),
    y: jitter(ySlots[index]),
  }));

  // Each column's text sits at a different height: one high, one centred,
  // one low.
  const textPositions = shuffle<TriptychPanel['textPosition']>([
    'top',
    'middle',
    'bottom',
  ]);

  // The re-reading column shows a project that actually has a re-reading,
  // and its frame opens that essay; the other two open the project entry.
  const paths = new Map(reReadingPaths);
  const shuffled = shuffle(projects);
  const readingProject =
    shuffled.find((project) => paths.has(project.slug)) ?? shuffled[0];
  const [aboutProject, repositoryProject] = shuffled.filter(
    (project) => project !== readingProject,
  );

  const toImage = (
    project: TriptychProject | undefined,
    href: string,
  ): TriptychPanel['image'] =>
    project
      ? { src: project.src, alt: project.alt, caption: project.title, href }
      : { src: '/under-construction.webp', alt: '', caption: '', href };

  const projectHref = (project: TriptychProject | undefined) =>
    localizeHref(lang, `/repository/${project?.slug ?? ''}`);
  const readingPath = readingProject && paths.get(readingProject.slug);

  const images = [
    toImage(aboutProject, projectHref(aboutProject)),
    toImage(repositoryProject, projectHref(repositoryProject)),
    toImage(
      readingProject,
      readingPath
        ? localizeHref(lang, `/readings/${readingPath}`)
        : projectHref(readingProject),
    ),
  ];

  return panels.map((panel, index) => ({
    ...panel,
    image: images[index],
    frame: frames[index],
    textPosition: textPositions[index],
  }));
}

/**
 * The home page is prerendered once; each visit draws its own images and
 * arrangement here, after hydration, and fades the collage in.
 */
export default function HomeTriptychShuffle(props: HomeTriptychShuffleProps) {
  const { lang } = useLocale();
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random seed must be drawn on the client only
    setSeed(Math.floor(Math.random() * 4294967296));
  }, []);

  const panels = useMemo(
    () => buildPanels(seed ?? 0, props, lang),
    [seed, props, lang],
  );

  return (
    <div
      className={`flex flex-col transition-opacity duration-500 lg:min-h-0 lg:flex-1 ${
        seed === null ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Remount on the new seed so the collage measures its fresh layout. */}
      <HomeTriptych key={seed ?? 'initial'} panels={panels} />
    </div>
  );
}
