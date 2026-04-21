import { sanandajReadingText } from './book-reading-sanandaj';
import { cafeKonjReading } from './cafe-konj-performances';
import { daabReading } from './daab';
import { equivalenceDistanceReading } from './equivalence-distance';
import { knockoutTournamentReading } from './knockout-tournament';
import { mappingKarimkhanReading } from './mapping-karimkhan';
import { whiteCubesReading } from './white-cubes';

export type ProjectReReading = {
  slug: string;
  title: string;
  author: string;
  credit?: string;
  role?: string;
  source?: string;
  year?: string;
  boldParagraphs?: string[];
  content: string;
};

const reReadings = [
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
  whiteCubesReading,
] satisfies ProjectReReading[];

export function getProjectReReading(slug: string) {
  return reReadings.find((reReading) => reReading.slug === slug);
}

export function getProjectReReadings() {
  return reReadings;
}

export function getReReadingParagraphs(reReading: ProjectReReading) {
  return reReading.content
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
