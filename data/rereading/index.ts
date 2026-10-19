import type { Locale } from '@/lib/i18n';
import { sanandajReadingText } from './book-reading-sanandaj';
import { cafeKonjReading } from './cafe-konj-performances';
import { daabReading } from './daab';
import { equivalenceDistanceReading } from './equivalence-distance';
import { knockoutTournamentReading } from './knockout-tournament';
import { mappingKarimkhanReading } from './mapping-karimkhan';
import { paintYourShadowOrangeReading } from './paint-your-shadow-orange';
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
  slug: string;
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
  paintYourShadowOrangeReading,
  whiteCubesReading,
];

function localizeReReading(
  reReading: ProjectReReading,
  lang?: Locale,
): ProjectReReading {
  if (lang === 'fa' && reReading.fa) {
    return { slug: reReading.slug, ...reReading.fa };
  }

  return reReading;
}

export function getProjectReReading(slug: string, lang?: Locale) {
  const reReading = reReadings.find((reReading) => reReading.slug === slug);

  return reReading && localizeReReading(reReading, lang);
}

export function getProjectReReadings(lang?: Locale) {
  return reReadings.map((reReading) => localizeReReading(reReading, lang));
}

export function getReReadingParagraphs(reReading: ProjectReReading) {
  return reReading.content
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
