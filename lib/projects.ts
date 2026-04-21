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
  '4. Participation & Process'?: {
    subsections?: {
      title: string;
      paragraphs: string[];
    }[];
  };
  '7. Project Documentation and Images'?: {
    items?: {
      type: string;
      src: string;
      description: string;
    }[];
  };
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

export function getProjectImage(project: Project) {
  const featuredImage =
    project['1. Basic Information']['Featured Project Image'].url.trim();
  const documentationImage =
    project['7. Project Documentation and Images']?.items?.find(
      (item) => item.type === 'photo' && item.src.trim().startsWith('/')
    )?.src;

  return (
    featuredImage ||
    documentationImage ||
    fallbackImages[project.slug] ||
    '/under-construction.png'
  );
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
