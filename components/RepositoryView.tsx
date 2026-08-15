'use client';

import { useState } from 'react';
import { useLocale } from './LocaleProvider';
import RepositoryMasonry from './RepositoryMasonry';
import RepositoryIndex from './RepositoryIndex';

type RepositoryCard = {
  slug: string;
  title: string;
  artists: string[];
  previewText: string;
  imageAlt: string;
  imageSrc: string;
};

type RepositoryViewProps = {
  projects: RepositoryCard[];
  layoutSeed: number;
};

type ViewMode = 'gallery' | 'index';

const viewModes: ViewMode[] = ['gallery', 'index'];

export default function RepositoryView({
  projects,
  layoutSeed,
}: RepositoryViewProps) {
  const { dict } = useLocale();
  const [view, setView] = useState<ViewMode>('gallery');

  return (
    <div>
      <div
        role='tablist'
        aria-label={dict.repository.tabsAriaLabel}
        className='mt-10 flex gap-6 border-b border-[#d9d2c7] sm:mt-12'
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
              {dict.repository.tabs[mode]}
            </button>
          );
        })}
      </div>

      {view === 'gallery' ? (
        <RepositoryMasonry projects={projects} layoutSeed={layoutSeed} />
      ) : (
        <RepositoryIndex projects={projects} />
      )}
    </div>
  );
}
