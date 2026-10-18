'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';

import { localizeHref } from '@/lib/i18n';

import { useLocale } from './LocaleProvider';

type RepositoryTagFilterProps = {
  // Every tag in the repository with its project count, most used first.
  tags: [string, number][];
  selectedTags: string[];
  searchQuery?: string;
};

const INITIAL_TAG_COUNT = 14;

export default function RepositoryTagFilter({
  tags,
  selectedTags,
  searchQuery,
}: RepositoryTagFilterProps) {
  const { dict, lang } = useLocale();
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const buildHref = (nextTags: string[]) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    for (const tag of nextTags) params.append('tag', tag);
    const query = params.toString();
    return `${localizeHref(lang, '/repository')}${query ? `?${query}` : ''}`;
  };

  // Selected tags stay visible even when the list is collapsed.
  const visibleTags = tagsExpanded
    ? tags
    : tags.filter(
        ([tag], index) =>
          index < INITIAL_TAG_COUNT || selectedTags.includes(tag),
      );

  if (tags.length === 0) return null;

  return (
    <div className='mt-8 sm:mt-10'>
      <p className='text-sm font-semibold text-black sm:text-base'>
        {dict.map.tagsLabel}
      </p>
      <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-2'>
        {visibleTags.map(([tag], index) => {
          const isSelected = selectedTags.includes(tag);
          const nextTags = isSelected
            ? selectedTags.filter((item) => item !== tag)
            : [...selectedTags, tag];

          return (
            <Fragment key={tag}>
              <Link
                href={buildHref(nextTags)}
                scroll={false}
                aria-current={isSelected ? 'true' : undefined}
                className={`text-[0.7rem] font-extrabold uppercase tracking-wide transition-colors sm:text-xs ${
                  isSelected
                    ? 'text-[#7f242a] underline underline-offset-4'
                    : 'text-[#4f4a43] hover:text-[#7f242a]'
                }`}
              >
                {tag}
                {isSelected && <span aria-hidden='true'> ×</span>}
              </Link>
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
        {tags.length > INITIAL_TAG_COUNT && (
          <button
            type='button'
            onClick={() => setTagsExpanded((current) => !current)}
            className='text-xs font-medium text-[#7f242a] transition-colors hover:text-black'
          >
            {tagsExpanded ? dict.map.showFewerThemes : dict.map.showMoreThemes}
          </button>
        )}
        {selectedTags.length > 0 && (
          <Link
            href={buildHref([])}
            scroll={false}
            className='text-xs font-medium text-[#7f242a] transition-colors hover:text-black'
          >
            {dict.map.clearFilter}
            <span aria-hidden='true'> ×</span>
          </Link>
        )}
      </div>
    </div>
  );
}
