import type { Locale } from '@/lib/i18n';
import { sanandajReadingText } from './book-reading-sanandaj';
import { cafeKonjReading } from './cafe-konj-performances';
import { daabReading } from './daab';
import { equivalenceDistanceReading } from './equivalence-distance';
import { knockoutTournamentReading } from './knockout-tournament';
import { mappingKarimkhanReading } from './mapping-karimkhan';
import { mappingKarimkhanFouReading } from './mapping-karimkhan-fou';
import { paintYourShadowOrangeReading } from './paint-your-shadow-orange';
import { talkSeeAttaranReading } from './talk-see-attaran';
import { talkSeeHedayatiReading } from './talk-see-hedayati';
import { whiteCubesReading } from './white-cubes';

type ReReadingText = {
  title: string;
  author: string;
  credit?: string;
  role?: string;
  source?: string;
  year?: string;
  boldParagraphs?: string[];
  content: string;
};

export type ProjectReReading = ReReadingText & {
  // The project this re-reading belongs to.
  slug: string;
  // The re-reading's own URL segment under /readings. Defaults to the
  // project slug; set it when a project has more than one re-reading.
  path?: string;
  // Languages the re-reading is shown in. Defaults to all of them.
  languages?: Locale[];
  fa?: ReReadingText;
};

const reReadings: ProjectReReading[] = [
  {
    ...sanandajReadingText,
    slug: 'book-reading-in-sanandaj-park',
  },
  cafeKonjReading,
  daabReading,
  {
    ...equivalenceDistanceReading,
    slug: 'an-equivalence-of-our-distance',
  },
  knockoutTournamentReading,
  mappingKarimkhanReading,
  mappingKarimkhanFouReading,
  paintYourShadowOrangeReading,
  talkSeeAttaranReading,
  talkSeeHedayatiReading,
  whiteCubesReading,
];

function localizeReReading(
  reReading: ProjectReReading,
  lang?: Locale,
): ProjectReReading {
  if (lang === 'fa' && reReading.fa) {
    return { slug: reReading.slug, path: reReading.path, ...reReading.fa };
  }

  return reReading;
}

function isShownIn(reReading: ProjectReReading, lang?: Locale) {
  return !lang || !reReading.languages || reReading.languages.includes(lang);
}

export function getReReadingPath(reReading: ProjectReReading) {
  return reReading.path ?? reReading.slug;
}

export function getProjectReReading(path: string, lang?: Locale) {
  const reReading = reReadings.find(
    (reReading) =>
      getReReadingPath(reReading) === path && isShownIn(reReading, lang),
  );

  return reReading && localizeReReading(reReading, lang);
}

export function getReReadingsForProject(slug: string, lang?: Locale) {
  return reReadings
    .filter(
      (reReading) => reReading.slug === slug && isShownIn(reReading, lang),
    )
    .map((reReading) => localizeReReading(reReading, lang));
}

export function getProjectReReadings(lang?: Locale) {
  return reReadings
    .filter((reReading) => isShownIn(reReading, lang))
    .map((reReading) => localizeReReading(reReading, lang));
}

// A paragraph made only of image lines, `![alt](src)` or `![alt](src "40%")`
// with an optional display width, is shown as images. Images on consecutive
// lines share a row.
export function getReReadingImages(paragraph: string) {
  const images = paragraph.split('\n').map((line) => {
    const match = line
      .trim()
      .match(/^!\[([^\]]*)\]\((\S+)(?:\s+"(\d+%)")?\)$/);

    return match ? { alt: match[1], src: match[2], width: match[3] } : null;
  });

  return images.every(Boolean)
    ? (images as { alt: string; src: string; width?: string }[])
    : null;
}

export function getReReadingParagraphs(reReading: ProjectReReading) {
  return reReading.content
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
