'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocale } from './LocaleProvider';
import { localizeHref } from '@/lib/i18n';

type SearchFormProps = {
  onSearch?: () => void;
  // Shows only the magnifier until it's clicked, then opens the field.
  collapsible?: boolean;
};

export default function SearchForm({ onSearch, collapsible }: SearchFormProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  return (
    <SearchFormFields
      key={initialQuery}
      initialQuery={initialQuery}
      onSearch={onSearch}
      collapsible={collapsible}
    />
  );
}

function SearchFormFields({
  initialQuery,
  onSearch,
  collapsible = false,
}: SearchFormProps & {
  initialQuery: string;
}) {
  const router = useRouter();
  const { lang, dict } = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [expanded, setExpanded] = useState(!collapsible || !!initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expanded) {
      flushSync(() => setExpanded(true));
      inputRef.current?.focus();
      return;
    }

    const trimmedQuery = query.trim();
    const href = trimmedQuery
      ? localizeHref(lang, `/repository?q=${encodeURIComponent(trimmedQuery)}`)
      : localizeHref(lang, '/repository');

    router.push(href);
    onSearch?.();
  };

  return (
    <form
      role='search'
      onSubmit={handleSubmit}
      onBlur={(event) => {
        if (
          collapsible &&
          !query.trim() &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setExpanded(false);
        }
      }}
      className={`flex items-center border-b transition-colors ${
        expanded ? 'border-black/40' : 'border-transparent'
      }`}
    >
      <input
        ref={inputRef}
        type='search'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (collapsible && event.key === 'Escape') {
            setQuery('');
            setExpanded(false);
          }
        }}
        placeholder={dict.search.placeholder}
        aria-label={dict.search.inputLabel}
        hidden={!expanded}
        className='w-28 bg-transparent py-1 text-[0.95rem] text-black outline-none placeholder:text-black/45 sm:w-32 lg:w-40'
      />
      <button
        type='submit'
        className='h-7 w-7 cursor-pointer text-black/70 transition-colors hover:text-[#7f242a]'
        aria-label={
          expanded ? dict.search.submitLabel : dict.search.inputLabel
        }
        aria-expanded={collapsible ? expanded : undefined}
      >
        <svg
          aria-hidden='true'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.8'
          className='h-4 w-4'
        >
          <circle cx='11' cy='11' r='6' />
          <path d='m16 16 4 4' />
        </svg>
      </button>
    </form>
  );
}
