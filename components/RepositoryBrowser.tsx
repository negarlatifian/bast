'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { formatLocaleNumber } from '@/lib/i18n';

import { useLocale } from './LocaleProvider';
import RepositoryTagFilter from './RepositoryTagFilter';
import RepositoryView from './RepositoryView';

export type RepositoryBrowserProject = {
  slug: string;
  title: string;
  artists: string[];
  tags: string[];
  previewText: string;
  searchText: string;
  imageAlt: string;
  imageSrc: string;
};

type RepositoryBrowserProps = {
  projects: RepositoryBrowserProject[];
  // Every tag in the repository with its project count, most used first.
  tags: [string, number][];
};

const NO_TAGS: string[] = [];

function shuffleProjects<T>(items: T[], seed: number) {
  const shuffledItems = [...items];
  let randomState = seed;

  const nextRandom = () => {
    randomState = (randomState * 1664525 + 1013904223) % 4294967296;
    return randomState / 4294967296;
  };

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(nextRandom() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

/**
 * The repository page is prerendered once and served from the CDN; search,
 * tag filtering and the per-visit shuffle all happen here in the browser.
 */
function RepositoryBrowserContent({
  projects,
  tags,
  query,
  selectedTags,
}: RepositoryBrowserProps & { query: string; selectedTags: string[] }) {
  const { dict, lang } = useLocale();
  // The prerendered HTML can't know the visitor, so the layout is drawn after
  // hydration and faded in, giving each visit its own arrangement.
  const [layoutSeed, setLayoutSeed] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random seed must be drawn on the client only
    setLayoutSeed(Math.floor(Math.random() * 4294967296));
  }, []);

  const searchQuery = query.trim().toLowerCase();
  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          (!searchQuery || project.searchText.includes(searchQuery)) &&
          selectedTags.every((selected) => project.tags.includes(selected)),
      ),
    [projects, searchQuery, selectedTags],
  );
  const visibleProjects = useMemo(
    () => shuffleProjects(filteredProjects, layoutSeed ?? 0),
    [filteredProjects, layoutSeed],
  );

  return (
    <>
      <RepositoryTagFilter
        tags={tags}
        selectedTags={selectedTags}
        searchQuery={query.trim()}
      />

      {(searchQuery || selectedTags.length > 0) && (
        <p className='mt-8 text-sm leading-6 text-[#4f4a43]'>
          {formatLocaleNumber(filteredProjects.length, lang)}{' '}
          {filteredProjects.length === 1
            ? dict.search.resultsFor
            : dict.search.resultsForPlural}{' '}
          {searchQuery && <>&ldquo;{query.trim()}&rdquo;</>}
          {searchQuery && selectedTags.length > 0 && ' · '}
          {selectedTags.length > 0 && (
            <span className='font-extrabold tracking-wide text-[#7f242a] uppercase'>
              {selectedTags.join(' · ')}
            </span>
          )}
        </p>
      )}

      <div
        className={`transition-opacity duration-500 ${
          layoutSeed === null ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <RepositoryView
          projects={visibleProjects}
          layoutSeed={layoutSeed ?? 0}
        />
      </div>
    </>
  );
}

/** Reads ?q= and ?tag= from the address bar. Needs a Suspense boundary. */
export default function RepositoryBrowser(props: RepositoryBrowserProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const tagParams = searchParams.getAll('tag');
  const tagKey = tagParams.join('\u0000');
  const selectedTags = useMemo(
    () =>
      Array.from(
        new Set(
          tagKey
            .split('\u0000')
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ),
    [tagKey],
  );

  return (
    <RepositoryBrowserContent
      {...props}
      query={query}
      selectedTags={selectedTags}
    />
  );
}

/** What the prerendered HTML shows before the address bar is read. */
export function RepositoryBrowserFallback(props: RepositoryBrowserProps) {
  return (
    <RepositoryBrowserContent {...props} query='' selectedTags={NO_TAGS} />
  );
}
