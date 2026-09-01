'use client';

import { useMemo, useState } from 'react';

import { useLocale } from './LocaleProvider';
import ProjectListRow from './ProjectListRow';
import { formatLocaleNumber } from '@/lib/i18n';
import {
  CITY_NETWORK_EDGES,
  IRAN_PATH_D,
  MAP_VIEW_BOX,
  mapCities,
  type MapCityId,
} from '@/lib/mapData';

export type MapProjectSummary = {
  slug: string;
  title: string;
  artists: string[];
  tags: string[];
  imageSrc: string;
  imageAlt: string;
};

export type MapPin = {
  id: MapCityId;
  name: string;
  x: number;
  y: number;
  projects: MapProjectSummary[];
};

export type MapThread = {
  slug: string;
  points: { x: number; y: number }[];
};

type ProjectsMapProps = {
  pins: MapPin[];
  threads: MapThread[];
  onlineProjects: MapProjectSummary[];
  selectedTag: string | null;
};

function markerSizeClass(count: number) {
  if (count >= 4) return 'h-5 w-5';
  if (count >= 2) return 'h-4 w-4';
  return 'h-3 w-3';
}

export default function ProjectsMap({
  pins,
  threads,
  onlineProjects,
  selectedTag,
}: ProjectsMapProps) {
  const { dict, lang } = useLocale();
  const [selectedCity, setSelectedCity] = useState<MapCityId | null>(null);
  const [hoveredCity, setHoveredCity] = useState<MapCityId | null>(null);

  const activeCity = hoveredCity ?? selectedCity;
  const selectedPin = pins.find((pin) => pin.id === selectedCity) ?? null;
  const { width, height } = MAP_VIEW_BOX;

  const mappedProjects = useMemo(() => {
    const bySlug = new Map<string, MapProjectSummary>();
    for (const pin of pins) {
      for (const project of pin.projects) {
        bySlug.set(project.slug, project);
      }
    }
    return Array.from(bySlug.values());
  }, [pins]);

  function matchesTag(project: MapProjectSummary) {
    return !selectedTag || project.tags.includes(selectedTag);
  }

  const threadPaths = threads.map((thread) => ({
    slug: thread.slug,
    d: thread.points
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
      )
      .join(' '),
    involvesActiveCity: activeCity
      ? pins
          .find((pin) => pin.id === activeCity)
          ?.projects.some((project) => project.slug === thread.slug)
      : false,
    matchesFilter: mappedProjects.some(
      (project) => project.slug === thread.slug && matchesTag(project),
    ),
  }));

  const networkEdgePoints = CITY_NETWORK_EDGES.map(([fromId, toId]) => {
    const from = mapCities[fromId];
    const to = mapCities[toId];
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }).join(' ');

  const filteredOnlineProjects = onlineProjects.filter(matchesTag);
  const globalMatches = selectedTag
    ? mappedProjects.filter(matchesTag)
    : [];

  return (
    <div>
      <div className='mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start'>
        <div
          dir='ltr'
          className='relative w-full lg:sticky lg:top-24 lg:w-1/2'
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          <svg
            aria-hidden='true'
            viewBox={`0 0 ${width} ${height}`}
            className='absolute inset-0 h-full w-full'
          >
            <defs>
              <pattern
                id='map-grain'
                width='4'
                height='4'
                patternUnits='userSpaceOnUse'
              >
                <circle cx='1' cy='1' r='0.6' fill='rgba(0,0,0,0.4)' />
              </pattern>
            </defs>

            <path
              d={IRAN_PATH_D}
              fill='#efe9dc'
              stroke='#7f242a'
              strokeWidth='1.4'
              strokeLinejoin='round'
              vectorEffect='non-scaling-stroke'
            />
            <path d={IRAN_PATH_D} fill='url(#map-grain)' opacity='0.16' />

            <path
              d={networkEdgePoints}
              fill='none'
              stroke='#7f242a'
              strokeWidth='0.9'
              strokeDasharray='1 3'
              strokeLinecap='round'
              vectorEffect='non-scaling-stroke'
              opacity={selectedTag ? 0.15 : 0.45}
              className='transition-opacity duration-300'
            />

            <g
              fill='none'
              stroke='#7f242a'
              strokeLinecap='round'
              vectorEffect='non-scaling-stroke'
            >
              {threadPaths.map((thread) => {
                const emphasize = thread.involvesActiveCity;
                const opacity = !thread.matchesFilter
                  ? 0.06
                  : emphasize
                    ? 1
                    : 0.7;

                return (
                  <path
                    key={thread.slug}
                    d={thread.d}
                    strokeWidth={emphasize && thread.matchesFilter ? 2.2 : 1.3}
                    opacity={opacity}
                    className='transition-[opacity,stroke-width] duration-300'
                  />
                );
              })}
            </g>
          </svg>

          <div className='absolute inset-0'>
            {pins.map((pin) => {
              const isActive = activeCity === pin.id;
              const matchedProjects = pin.projects.filter(matchesTag);
              const hasMatch = matchedProjects.length > 0;
              const displayCount = selectedTag
                ? matchedProjects.length
                : pin.projects.length;
              const displayCountLabel = formatLocaleNumber(displayCount, lang);
              const xPercent = (pin.x / width) * 100;
              const yPercent = (pin.y / height) * 100;

              return (
                <button
                  key={pin.id}
                  type='button'
                  onClick={() =>
                    setSelectedCity((current) =>
                      current === pin.id ? null : pin.id,
                    )
                  }
                  onMouseEnter={() => setHoveredCity(pin.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onFocus={() => setHoveredCity(pin.id)}
                  onBlur={() => setHoveredCity(null)}
                  aria-pressed={selectedCity === pin.id}
                  aria-label={`${pin.name} — ${displayCountLabel}`}
                  className='absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation transition-opacity duration-300'
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    opacity: hasMatch ? 1 : 0.25,
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden='true'
                      className='absolute left-1/2 top-1/2 -z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-[#7f242a]/40'
                    />
                  )}
                  <span
                    className={`block rounded-full border-2 border-[rgb(248,248,246)] bg-[#7f242a] shadow-sm transition-transform duration-300 ${markerSizeClass(
                      displayCount || 1,
                    )} ${isActive ? 'scale-125' : ''}`}
                  />
                  <span
                    aria-hidden='true'
                    className={`pointer-events-none absolute left-1/2 top-full z-10 w-px -translate-x-1/2 bg-[#7f242a] transition-[height,opacity] duration-200 ${
                      isActive ? 'h-3 opacity-100' : 'h-0 opacity-0'
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full z-10 mt-3 -translate-x-1/2 whitespace-nowrap border border-[#7f242a]/30 bg-[rgb(248,248,246)] px-2 py-1 text-[0.72rem] leading-4 text-[rgb(54,54,54)] shadow-sm transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {pin.name} — {displayCountLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className='w-full lg:w-1/2'>
          {selectedPin ? (
            <div>
              <h2 className='text-lg font-semibold leading-6 text-[rgb(54,54,54)]'>
                {selectedPin.name}
              </h2>
              <div className='mt-3'>
                {selectedPin.projects.filter(matchesTag).length > 0 ? (
                  selectedPin.projects
                    .filter(matchesTag)
                    .map((project) => (
                      <ProjectListRow key={project.slug} project={project} />
                    ))
                ) : (
                  <p className='py-3 text-sm leading-6 text-[#777066]'>
                    {dict.map.noMatchesHere}
                  </p>
                )}
              </div>
            </div>
          ) : selectedTag ? (
            <div>
              <h2 className='text-lg font-semibold leading-6 text-[rgb(54,54,54)]'>
                {selectedTag}
              </h2>
              <div className='mt-3'>
                {globalMatches.length > 0 ? (
                  globalMatches.map((project) => (
                    <ProjectListRow key={project.slug} project={project} />
                  ))
                ) : (
                  <p className='py-3 text-sm leading-6 text-[#777066]'>
                    {dict.map.noMatchesHere}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className='text-sm leading-6 text-[#777066]'>{dict.map.hint}</p>
          )}
        </div>
      </div>

      <p className='mx-auto mt-4 max-w-5xl text-center text-xs leading-5 text-[#777066]'>
        {dict.map.disclaimer}
      </p>

      {filteredOnlineProjects.length > 0 && (
        <div className='mx-auto mt-12 max-w-5xl border-t border-[#d9d2c7] pt-8'>
          <h2 className='text-lg font-semibold leading-6 text-[rgb(54,54,54)]'>
            {dict.map.onlineTitle}
          </h2>
          <div className='mt-3'>
            {filteredOnlineProjects.map((project) => (
              <ProjectListRow key={project.slug} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
