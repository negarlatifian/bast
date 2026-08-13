import fs from 'node:fs';
import path from 'node:path';

import type { Locale } from './i18n';
import { pickArray, pickString } from './merge';

import anExperienceInTir from '@/data/projects/an-experience-in-tir.json';
import bookReadingSanandaj from '@/data/projects/book-reading-sanandaj.json';
import cafeKonjPerformances from '@/data/projects/cafe-konj-performances.json';
import daab from '@/data/projects/daab.json';
import enghelabAzadi from '@/data/projects/enghelab-azadi.json';
import equivalenceDistance from '@/data/projects/equivalence-distance.json';
import fromAfarIKissYou from '@/data/projects/from-afar-i-kiss-you.json';
import karimkhan from '@/data/projects/karimkhan.json';
import knockout from '@/data/projects/knockout.json';
import owzar from '@/data/projects/owzar.json';
import paintYourShadowOrange from '@/data/projects/paint-your-shadow-orange.json';
import paper from '@/data/projects/paper.json';
import postOnion from '@/data/projects/post-onion.json';
import printingMachine from '@/data/projects/printing-machine.json';
import radioKhiaban from '@/data/projects/radio-khiaban.json';
import stones from '@/data/projects/stones.json';
import talkSee from '@/data/projects/talk-see.json';
import tehranMonoxide from '@/data/projects/tehran-monoxide.json';
import theSecretOfLaleh from '@/data/projects/the-secret-of-laleh.json';
import whiteCubes from '@/data/projects/white-cubes.json';
import workers from '@/data/projects/workers.json';

export type Project = {
  slug: string;
  '1. Basic Information': {
    'Project Title': string;
    'Artist / Group / Collective / Organizer / Supervisor / Initiator': string[];
    Location: {
      text: string;
    };
    'Year / Time Period': {
      text: string;
    };
    'Featured Project Image': {
      url: string;
      alt: string;
      /**
       * Optional CSS object-position for the hero crop, e.g. 'center 85%'.
       * Defaults to 'center' when omitted.
       */
      position?: string;
    };
    'Thematic Tags'?: string[];
  };
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    quotes?: { text: string; attribution?: string }[];
    contact?: {
      platform: string;
      handle: string;
      url: string;
    }[];
  }[];
  'Participation & Process'?: {
    subsections?: {
      title: string;
      paragraphs: string[];
      quotes?: { text: string; attribution?: string }[];
    }[];
  };
  'Visual Documentation'?: {
    items?: {
      type: string;
      src: string;
      description: string;
    }[];
  };
  /**
   * Closing attribution line(s) shown at the end of the project page. When
   * absent, a generic fallback is used instead (see dict.project.editorialNote).
   */
  'Editorial Notes'?: string[];
  /**
   * Optional Farsi translation. Any field left empty falls back to English,
   * so this block can be filled in gradually. Sections are matched by `id`
   * and participation subsections by their position in the English array.
   */
  fa?: {
    '1. Basic Information'?: {
      'Project Title'?: string;
      'Artist / Group / Collective / Organizer / Supervisor / Initiator'?: string[];
      Location?: { text?: string };
      'Year / Time Period'?: { text?: string };
      'Featured Project Image'?: { alt?: string };
    };
    sections?: {
      id: string;
      title?: string;
      paragraphs?: string[];
      quotes?: { text: string; attribution?: string }[];
    }[];
    'Participation & Process'?: {
      subsections?: {
        title?: string;
        paragraphs?: string[];
        quotes?: { text: string; attribution?: string }[];
      }[];
    };
    'Editorial Notes'?: string[];
  };
};

export type ProjectMedia = {
  type: 'photo' | 'video' | 'link';
  src: string;
  description: string;
};

export const projects = [
  anExperienceInTir,
  bookReadingSanandaj,
  cafeKonjPerformances,
  daab,
  enghelabAzadi,
  equivalenceDistance,
  fromAfarIKissYou,
  karimkhan,
  knockout,
  owzar,
  paintYourShadowOrange,
  paper,
  postOnion,
  printingMachine,
  radioKhiaban,
  stones,
  talkSee,
  tehranMonoxide,
  theSecretOfLaleh,
  whiteCubes,
  workers,
] satisfies Project[];

const fallbackImages: Record<string, string> = {
  'talk-see-taxi-project': '/images/talk-see/thumb.webp',
};

const projectMediaFolders: Record<string, string> = {
  'book-reading-in-sanandaj-park': 'sanandaj-reading',
  'cafe-konj-performances': 'cafe-konj',
  daab: 'daab',
  'an-equivalence-of-our-distance': 'equivalence',
  'mapping-karimkhan': 'karimkhan',
  'knockout-tournament-ping-pong': 'knock-out',
  'paint-your-shadow-orange': 'paint-shadow',
  'post-onion': 'post-onion',
  'printing-machine-dastgah-e-chap': 'printing-machine',
  'talk-see-taxi-project': 'talk-see',
  'tehran-monoxide': 'tehran-monoxide',
  'white-cubes': 'white-cubes',
  'workers-dont-go-to-the-factory': 'kargaran',
};

const photoExtensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp']);
const videoExtensions = new Set(['.mov', '.mp4', '.webm']);

/**
 * Short excerpt for repository card hover previews: the first paragraph of
 * the introduction section (id "2"), falling back to the first section with
 * any paragraph text.
 */
export function getProjectPreviewText(project: Project): string {
  const introSection = project.sections.find((section) => section.id === '2');
  const firstParagraph =
    introSection?.paragraphs[0] ??
    project.sections.find((section) => section.paragraphs.length > 0)
      ?.paragraphs[0];

  return firstParagraph ?? '';
}

export function getProjectImage(project: Project) {
  const featuredImage =
    project['1. Basic Information']['Featured Project Image'].url.trim();
  const documentationImage =
    project['Visual Documentation']?.items?.find(
      (item) => item.type === 'photo' && item.src.trim().startsWith('/')
    )?.src;

  return (
    featuredImage ||
    documentationImage ||
    fallbackImages[project.slug] ||
    '/under-construction.webp'
  );
}

export type ProjectYearRange = {
  start: number;
  end: number;
  ongoing: boolean;
};

const yearPattern = /(?:19|20)\d{2}/g;

/**
 * Parses a sortable year range out of the free-text "Year / Time Period"
 * field (e.g. "2023-2024", "First phase: 2017", "2017–ongoing"). Always
 * run against the English source text — the field is one of the ones
 * `localizeProject` swaps for a Farsi string, and Farsi numerals won't
 * match this pattern. Returns null when the text has no parseable year.
 */
export function getProjectYearRange(project: Project): ProjectYearRange | null {
  const text = project['1. Basic Information']['Year / Time Period'].text;
  const years = (text.match(yearPattern) ?? []).map(Number);

  if (years.length === 0) {
    return null;
  }

  const ongoing = /ongoing|present/i.test(text);

  return {
    start: Math.min(...years),
    end: ongoing ? new Date().getFullYear() : Math.max(...years),
    ongoing,
  };
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/**
 * Return a copy of the project with its Farsi translation applied where
 * available, falling back to English field by field. For English (or any
 * project without a `fa` block) the project is returned unchanged.
 */
export function localizeProject(project: Project, locale: Locale): Project {
  const fa = project.fa;

  if (locale === 'en' || !fa) {
    return project;
  }

  const basic = project['1. Basic Information'];
  const faBasic = fa['1. Basic Information'];

  return {
    ...project,
    '1. Basic Information': {
      ...basic,
      'Project Title': pickString(
        basic['Project Title'],
        faBasic?.['Project Title'],
      ),
      'Artist / Group / Collective / Organizer / Supervisor / Initiator':
        pickArray(
          basic[
            'Artist / Group / Collective / Organizer / Supervisor / Initiator'
          ],
          faBasic?.[
            'Artist / Group / Collective / Organizer / Supervisor / Initiator'
          ],
        ),
      Location: {
        ...basic.Location,
        text: pickString(basic.Location.text, faBasic?.Location?.text),
      },
      'Year / Time Period': {
        ...basic['Year / Time Period'],
        text: pickString(
          basic['Year / Time Period'].text,
          faBasic?.['Year / Time Period']?.text,
        ),
      },
      'Featured Project Image': {
        ...basic['Featured Project Image'],
        alt: pickString(
          basic['Featured Project Image'].alt,
          faBasic?.['Featured Project Image']?.alt,
        ),
      },
    },
    sections: project.sections.map((section) => {
      const faSection = fa.sections?.find((item) => item.id === section.id);
      return {
        ...section,
        title: pickString(section.title, faSection?.title),
        paragraphs: pickArray(section.paragraphs, faSection?.paragraphs),
        quotes: section.quotes
          ? pickArray(section.quotes, faSection?.quotes)
          : section.quotes,
      };
    }),
    'Participation & Process': project['Participation & Process']
      ? {
          ...project['Participation & Process'],
          subsections: project['Participation & Process']?.subsections?.map(
            (subsection, index) => {
              const faSubsection =
                fa['Participation & Process']?.subsections?.[index];
              return {
                ...subsection,
                title: pickString(subsection.title, faSubsection?.title),
                paragraphs: pickArray(
                  subsection.paragraphs,
                  faSubsection?.paragraphs,
                ),
                quotes: subsection.quotes
                  ? pickArray(subsection.quotes, faSubsection?.quotes)
                  : subsection.quotes,
              };
            },
          ),
        }
      : project['Participation & Process'],
    'Editorial Notes': project['Editorial Notes']
      ? pickArray(project['Editorial Notes'], fa['Editorial Notes'])
      : project['Editorial Notes'],
  };
}

function getMediaType(src: string): ProjectMedia['type'] {
  const extension = path.extname(src).toLowerCase();

  if (photoExtensions.has(extension)) {
    return 'photo';
  }

  if (videoExtensions.has(extension) || src.includes('vimeo.com')) {
    return 'video';
  }

  return 'link';
}

function isUsableMediaSrc(src: string) {
  const trimmedSrc = src.trim();

  return (
    trimmedSrc &&
    !path.basename(trimmedSrc).toLowerCase().startsWith('thumb.') &&
    (trimmedSrc.startsWith('/') || trimmedSrc.startsWith('http'))
  );
}

function getFolderMedia(project: Project): ProjectMedia[] {
  const folder = projectMediaFolders[project.slug];

  if (!folder) {
    return [];
  }

  const folderPath = path.join(process.cwd(), 'public', 'images', folder);

  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const files = fs.readdirSync(folderPath);
  const webpBaseNames = new Set(
    files
      .filter((fileName) => path.extname(fileName).toLowerCase() === '.webp')
      .map((fileName) => path.basename(fileName, path.extname(fileName)))
  );

  return files
    .filter((fileName) => {
      const extension = path.extname(fileName).toLowerCase();
      const baseName = path.basename(fileName).toLowerCase();
      const baseNameWithoutExtension = path.basename(fileName, extension);

      return (
        !baseName.startsWith('thumb.') &&
        (extension === '.webp' || !webpBaseNames.has(baseNameWithoutExtension)) &&
        (photoExtensions.has(extension) || videoExtensions.has(extension))
      );
    })
    .sort((first, second) =>
      first.localeCompare(second, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    )
    .map((fileName) => {
      const src = `/images/${folder}/${fileName}`;

      return {
        type: getMediaType(src),
        src,
        description: '',
      };
    });
}

export function getProjectMedia(project: Project): ProjectMedia[] {
  const visualDocumentationItems =
    project['Visual Documentation']?.items
      ?.filter((item) => isUsableMediaSrc(item.src))
      .map((item) => {
        const src = item.src.trim();
        return {
          type: getMediaType(src),
          src,
          description: item.description,
        };
      }) ?? [];

  if (visualDocumentationItems.length > 0) {
    return visualDocumentationItems;
  }

  return getFolderMedia(project);
}
