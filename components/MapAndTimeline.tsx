'use client';

import { Fragment, useMemo, useState } from 'react';

import { useLocale } from './LocaleProvider';
import ProjectsMap, {
  type MapPin,
  type MapProjectSummary,
  type MapThread,
} from './ProjectsMap';
import ProjectsTimeline, { type TimelineProject } from './ProjectsTimeline';

type MapAndTimelineProps = {
  pins: MapPin[];
  threads: MapThread[];
  onlineProjects: MapProjectSummary[];
  timelineProjects: TimelineProject[];
};

type ViewMode = 'timeline' | 'map';

const viewModes: ViewMode[] = ['timeline', 'map'];
const INITIAL_TAG_COUNT = 14;

export default function MapAndTimeline({
  pins,
  threads,
  onlineProjects,
  timelineProjects,
}: MapAndTimelineProps) {
  const { dict } = useLocale();
  const [view, setView] = useState<ViewMode>('timeline');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const sortedTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of timelineProjects) {
      for (const tag of project.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [timelineProjects]);

  const visibleTags = tagsExpanded
    ? sortedTags
    : sortedTags.slice(0, INITIAL_TAG_COUNT);

  return (
    <div>
      <div className='mt-8 sm:mt-10'>
        <p className='text-sm font-semibold text-black sm:text-base'>
          {dict.map.tagsLabel}
        </p>
        <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-2'>
          {visibleTags.map(([tag], index) => {
            const isSelected = selectedTag === tag;

            return (
              <Fragment key={tag}>
                <button
                  type='button'
                  onClick={() =>
                    setSelectedTag((current) =>
                      current === tag ? null : tag,
                    )
                  }
                  className={`text-[0.7rem] font-extrabold uppercase tracking-wide transition-colors sm:text-xs ${
                    isSelected
                      ? 'text-[#7f242a] underline underline-offset-4'
                      : 'text-[#4f4a43] hover:text-[#7f242a]'
                  }`}
                >
                  {tag}
                </button>
                {index < visibleTags.length - 1 && (
                  <span
                    aria-hidden='true'
                    className='h-3.5 w-0.5 shrink-0 bg-[#7f242a] sm:h-4'
                  />
                )}
              </Fragment>
            );
          })}
        </div>
        <div className='mt-2 flex items-center gap-4'>
          {sortedTags.length > INITIAL_TAG_COUNT && (
            <button
              type='button'
              onClick={() => setTagsExpanded((current) => !current)}
              className='text-xs font-medium text-[#7f242a] transition-colors hover:text-black'
            >
              {tagsExpanded
                ? dict.map.showFewerThemes
                : dict.map.showMoreThemes}
            </button>
          )}
          {selectedTag && (
            <button
              type='button'
              onClick={() => setSelectedTag(null)}
              className='text-xs font-medium text-[#7f242a] transition-colors hover:text-black'
            >
              {dict.map.clearFilter}
              <span aria-hidden='true'> ×</span>
            </button>
          )}
        </div>
      </div>

      <div
        role='tablist'
        aria-label={dict.map.tabsAriaLabel}
        className='mt-8 flex gap-6 border-b border-black/10 sm:mt-10'
      >
        {viewModes.map((mode) => {
          const isActive = view === mode;

          return (
            <button
              key={mode}
              type='button'
              role='tab'
              aria-selected={isActive}
              onClick={() => setView(mode)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f242a] sm:text-[0.95rem] ${
                isActive
                  ? 'border-[#7f242a] text-[#7f242a]'
                  : 'border-transparent text-[rgb(54,54,54)] hover:border-[#7f242a]/40 hover:text-[#7f242a]'
              }`}
            >
              {dict.map.tabs[mode]}
            </button>
          );
        })}
      </div>

      {view === 'timeline' ? (
        <ProjectsTimeline projects={timelineProjects} selectedTag={selectedTag} />
      ) : (
        <ProjectsMap
          pins={pins}
          threads={threads}
          onlineProjects={onlineProjects}
          selectedTag={selectedTag}
        />
      )}
    </div>
  );
}
