'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { useLocale } from './LocaleProvider';
import { formatLocaleNumber, localizeHref } from '@/lib/i18n';

export type TimelineProject = {
  slug: string;
  title: string;
  artists: string[];
  tags: string[];
  imageSrc: string;
  imageAlt: string;
  yearLabel: string;
  start: number;
  end: number;
  ongoing: boolean;
};

type ProjectsTimelineProps = {
  projects: TimelineProject[];
  selectedTag: string | null;
};

function sortProjects(items: TimelineProject[]): TimelineProject[] {
  return [...items].sort(
    (a, b) => a.start - b.start || a.title.localeCompare(b.title),
  );
}

const ROW_SIZE = 4;
const VIEW_WIDTH = 1000;
const ROW_HEIGHT = 270;
const LINE_INSET = 60;

type Row = {
  label: number;
  items: TimelineProject[];
  goingRight: boolean;
  y: number;
  xStart: number;
  xEnd: number;
};

function buildRows(items: TimelineProject[]): Row[] {
  const rows: Row[] = [];

  for (let i = 0; i < items.length; i += ROW_SIZE) {
    const rowItems = items.slice(i, i + ROW_SIZE);
    const rowIndex = rows.length;
    const goingRight = rowIndex % 2 === 0;

    rows.push({
      label: rowItems[0].start,
      items: rowItems,
      goingRight,
      y: rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2,
      xStart: goingRight ? LINE_INSET : VIEW_WIDTH - LINE_INSET,
      xEnd: goingRight ? VIEW_WIDTH - LINE_INSET : LINE_INSET,
    });
  }

  return rows;
}

function TimelineThumb({ project }: { project: TimelineProject }) {
  return (
    <span className='relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#7f242a]/60 transition-colors duration-300 group-hover:border-[#7f242a]'>
      <Image
        src={project.imageSrc}
        alt={project.imageAlt}
        fill
        sizes='56px'
        className='object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0'
      />
      <span className='absolute inset-0 bg-[#d67878]/40 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0' />
      <span
        aria-hidden='true'
        className='absolute inset-0 opacity-20 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0'
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
          backgroundSize: '4px 4px',
        }}
      />
    </span>
  );
}

function TimelineCard({
  project,
  above,
}: {
  project: TimelineProject;
  above: boolean;
}) {
  const { lang } = useLocale();

  return (
    <Link
      href={localizeHref(lang, `/repository/${project.slug}`)}
      className={`group absolute start-1/2 flex w-28 -translate-x-1/2 flex-col items-center gap-1.5 rounded-sm text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f242a] ${
        above ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
      }`}
    >
      {!above && <TimelineThumb project={project} />}
      <span className='flex flex-col gap-0.5'>
        <span className='text-[0.75rem] font-semibold leading-4 text-[#7f242a]'>
          {formatLocaleNumber(project.start, lang)}
          {project.ongoing ? '–' : ''}
        </span>
        <span className='line-clamp-2 text-[0.72rem] font-medium leading-4 text-[rgb(30,28,26)] transition-colors group-hover:text-[#7f242a]'>
          {project.title}
        </span>
      </span>
      {above && <TimelineThumb project={project} />}
      <span
        aria-hidden='true'
        className={`absolute start-1/2 h-2 w-px -translate-x-1/2 bg-[#7f242a]/70 ${
          above ? 'top-full' : 'bottom-full'
        }`}
      />
    </Link>
  );
}

function SnakeTimeline({ rows }: { rows: Row[] }) {
  const { lang } = useLocale();
  const totalHeight = rows.length * ROW_HEIGHT;

  const pathD = rows
    .map((row, index) =>
      index === 0
        ? `M ${row.xStart} ${row.y} L ${row.xEnd} ${row.y}`
        : `L ${row.xStart} ${row.y} L ${row.xEnd} ${row.y}`,
    )
    .join(' ');

  return (
    <div
      dir='ltr'
      className='relative mx-auto hidden w-full max-w-4xl sm:block'
      style={{ aspectRatio: `${VIEW_WIDTH} / ${totalHeight}` }}
    >
      <svg
        aria-hidden='true'
        viewBox={`0 0 ${VIEW_WIDTH} ${totalHeight}`}
        className='absolute inset-0 h-full w-full overflow-visible'
      >
        <path
          d={pathD}
          fill='none'
          stroke='#7f242a'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>

      <div className='absolute inset-0'>
        {rows.map((row) => {
          const slots = row.items.length + 1;
          const decadeX =
            row.xStart + (row.xEnd - row.xStart) * (0.5 / slots);

          return (
            <div key={`${row.label}-${row.y}`}>
              <span
                className='absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-[rgb(248,248,246)] px-2 py-1 text-lg font-semibold text-[#7f242a] sm:text-xl'
                style={{
                  left: `${(decadeX / VIEW_WIDTH) * 100}%`,
                  top: `${(row.y / totalHeight) * 100}%`,
                }}
              >
                {formatLocaleNumber(row.label, lang)}
              </span>

              {row.items.map((project, itemIndex) => {
                const slotIndex = itemIndex + 1;
                const x =
                  row.xStart +
                  (row.xEnd - row.xStart) * ((slotIndex + 0.5) / slots);

                return (
                  <div
                    key={project.slug}
                    className='absolute h-0 w-0'
                    style={{
                      left: `${(x / VIEW_WIDTH) * 100}%`,
                      top: `${(row.y / totalHeight) * 100}%`,
                    }}
                  >
                    <TimelineCard
                      project={project}
                      above={itemIndex % 2 === 0}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileTimelineList({ projects }: { projects: TimelineProject[] }) {
  const { lang } = useLocale();

  return (
    <ol className='relative mx-auto max-w-md pb-4 ps-7 sm:hidden'>
      <div
        aria-hidden='true'
        className='absolute bottom-0 top-0 w-px bg-[#7f242a]/25 start-3'
      />
      {projects.map((project) => (
        <li key={project.slug} className='relative py-3 first:pt-0'>
          <span
            aria-hidden='true'
            className='absolute top-6 block h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-[rgb(248,248,246)] bg-[#7f242a] -start-4'
          />
          <Link
            href={localizeHref(lang, `/repository/${project.slug}`)}
            className='group flex items-center gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f242a]'
          >
            <TimelineThumb project={project} />
            <span className='flex min-w-0 flex-1 flex-col'>
              <span className='text-[0.72rem] font-semibold text-[#7f242a]'>
                {formatLocaleNumber(project.start, lang)}
              </span>
              <span className='truncate text-[1rem] font-medium text-[rgb(30,28,26)] transition-colors group-hover:text-[#7f242a]'>
                {project.title}
              </span>
              {project.artists.length > 0 && (
                <span className='truncate text-[0.8rem] text-[#8a8478]'>
                  {project.artists.join(', ')}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function ProjectsTimeline({
  projects,
  selectedTag,
}: ProjectsTimelineProps) {
  const { dict } = useLocale();

  const visibleProjects = selectedTag
    ? projects.filter((project) => project.tags.includes(selectedTag))
    : projects;

  const sortedProjects = useMemo(
    () => sortProjects(visibleProjects),
    [visibleProjects],
  );

  const rows = useMemo(() => buildRows(sortedProjects), [sortedProjects]);

  if (sortedProjects.length === 0) {
    return (
      <p className='mt-10 text-sm leading-6 text-[#777066]'>
        {dict.map.noMatchesHere}
      </p>
    );
  }

  return (
    <div className='mt-16 sm:mt-24'>
      <SnakeTimeline rows={rows} />
      <MobileTimelineList projects={sortedProjects} />
    </div>
  );
}
