import fs from 'node:fs';
import path from 'node:path';

import bookReadingSanandaj from '@/data/projects/book-reading-sanandaj.json';
import cafeKonjPerformances from '@/data/projects/cafe-konj-performances.json';
import daab from '@/data/projects/daab.json';
import equivalenceDistance from '@/data/projects/equivalence-distance.json';
import karimkhan from '@/data/projects/karimkhan.json';
import knockout from '@/data/projects/knockout.json';
import paintYourShadowOrange from '@/data/projects/paint-your-shadow-orange.json';
import postOnion from '@/data/projects/post-onion.json';
import printingMachine from '@/data/projects/printing-machine.json';
import talkSee from '@/data/projects/talk-see.json';
import tehranMonoxide from '@/data/projects/tehran-monoxide.json';
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
    };
  };
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
  }[];
  'Participation & Process'?: {
    subsections?: {
      title: string;
      paragraphs: string[];
    }[];
  };
  'Visual Documentation'?: {
    items?: {
      type: string;
      src: string;
      description: string;
    }[];
  };
};

export type ProjectMedia = {
  type: 'photo' | 'video' | 'link';
  src: string;
  description: string;
};

export const projects = [
  bookReadingSanandaj,
  cafeKonjPerformances,
  daab,
  equivalenceDistance,
  karimkhan,
  knockout,
  paintYourShadowOrange,
  postOnion,
  printingMachine,
  talkSee,
  tehranMonoxide,
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
  'an-equivalence-of-our-distance': 'equivalance',
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

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

function getMediaType(src: string): ProjectMedia['type'] {
  const extension = path.extname(src).toLowerCase();

  if (photoExtensions.has(extension)) {
    return 'photo';
  }

  if (videoExtensions.has(extension)) {
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
