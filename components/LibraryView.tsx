'use client';

import { useMemo, useState } from 'react';
import { useLocale } from './LocaleProvider';
import { formatLocaleNumber } from '@/lib/i18n';
import type { LibraryEntry } from '@/data/library';

type LibraryViewProps = {
  entriesByLanguage: Record<'en' | 'fa', LibraryEntry[]>;
};

type ViewMode = 'en' | 'fa';

type FormatGroup = {
  format: string;
  items: LibraryEntry[];
};

const viewModes: ViewMode[] = ['en', 'fa'];

const formatOrder: Record<ViewMode, string[]> = {
  en: ['Book', 'Book Chapter', 'Website'],
  fa: ['کتاب', 'مقاله', 'وبسایت', 'کانال تلگرام'],
};

function groupByFormat(entries: LibraryEntry[], lang: ViewMode): FormatGroup[] {
  const order = formatOrder[lang];
  const groups = new Map<string, LibraryEntry[]>();

  for (const entry of entries) {
    const key = entry.format ?? '';
    const existing = groups.get(key);

    if (existing) {
      existing.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);

      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .map(([format, items]) => ({ format, items }));
}

function hashSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Neutral fills already used elsewhere on the site as placeholder/panel
// backgrounds (image placeholder + hover-preview canvas), reused here
// rather than introducing new colors.
const spineHeights = [
  { heightClass: 'h-36 sm:h-40', labelMaxWidth: 118 },
  { heightClass: 'h-44 sm:h-48', labelMaxWidth: 150 },
  { heightClass: 'h-52 sm:h-56', labelMaxWidth: 182 },
];

const spineWidths = ['w-8 sm:w-9', 'w-10 sm:w-11', 'w-12 sm:w-14'];

const spineFills = ['bg-[#efe9dc]', 'bg-[#e9e3d6]', 'bg-[#d9d2c7]'];

// Call-number prefixes, kept in Latin/numeric characters on both tabs —
// the way a real catalog number stays legible regardless of the
// language of the book it points to.
const formatCodes: Record<ViewMode, Record<string, string>> = {
  en: { Book: 'BK', 'Book Chapter': 'BC', Website: 'WS' },
  fa: { کتاب: 'BK', مقاله: 'AR', وبسایت: 'WS', 'کانال تلگرام': 'TG' },
};

function getCallNumber(view: ViewMode, format: string, indexInGroup: number) {
  const code = formatCodes[view][format] ?? 'XX';
  return `${code}.${view.toUpperCase()}.${String(indexInGroup + 1).padStart(2, '0')}`;
}

function getSpineStyle(slug: string) {
  const hash = hashSlug(slug);
  return {
    size: spineHeights[hash % spineHeights.length],
    width: spineWidths[(hash >>> 2) % spineWidths.length],
    fill: spineFills[(hash >>> 4) % spineFills.length],
  };
}

function CropMarks({ fadeOnHover = false }: { fadeOnHover?: boolean }) {
  const positions = [
    '-top-[5px] -left-[5px]',
    '-top-[5px] -right-[5px] rotate-90',
    '-bottom-[5px] -left-[5px] -rotate-90',
    '-bottom-[5px] -right-[5px] rotate-180',
  ];

  return (
    <>
      {positions.map((position) => (
        <svg
          key={position}
          aria-hidden='true'
          viewBox='0 0 10 10'
          className={`pointer-events-none absolute h-2.5 w-2.5 text-[#7f242a] transition-opacity duration-200 ${
            fadeOnHover ? 'opacity-0 group-hover:opacity-100' : ''
          } ${position}`}
        >
          <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
        </svg>
      ))}
    </>
  );
}

function ShelfLabel({ format, count }: { format: string; count: number }) {
  const { lang } = useLocale();

  return (
    <div className='mb-5 flex items-center gap-3'>
      <svg aria-hidden='true' viewBox='0 0 10 10' className='h-3 w-3 shrink-0 text-[#7f242a]'>
        <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
      </svg>
      <h3 className='shrink-0 text-lg font-semibold tracking-wide text-[#7f242a] uppercase sm:text-xl'>
        {format}
      </h3>
      <span className='h-px flex-1 bg-[#d9d2c7]' />
      <span className='shrink-0 text-xs text-[#a39a8d]'>
        {formatLocaleNumber(count, lang)}
      </span>
    </div>
  );
}

function Shelf({ group, view }: { group: FormatGroup; view: ViewMode }) {
  const [selectedSlug, setSelectedSlug] = useState(group.items[0]?.slug);
  const selectedIndex = Math.max(
    0,
    group.items.findIndex((item) => item.slug === selectedSlug),
  );
  const selectedEntry = group.items[selectedIndex] ?? group.items[0];

  return (
    <section className='mt-14 first:mt-8'>
      <ShelfLabel format={group.format} count={group.items.length} />

      <div className='overflow-x-auto pb-1'>
        <div className='flex items-end gap-1.5 px-1'>
          {group.items.map((entry) => {
            const { size, width, fill } = getSpineStyle(entry.slug);
            const isSelected = entry.slug === selectedEntry?.slug;
            const meta = [entry.author, entry.publisher].filter(Boolean).join(', ');

            return (
              <button
                key={entry.slug}
                type='button'
                aria-pressed={isSelected}
                title={meta ? `${entry.title} — ${meta}` : entry.title}
                onClick={() => setSelectedSlug(entry.slug)}
                className={`group relative flex shrink-0 flex-col items-center justify-center overflow-hidden border border-[#d9d2c7] ${fill} ${width} ${
                  size.heightClass
                } transition-transform duration-200 ${
                  isSelected ? '-translate-y-1.5' : 'hover:-translate-y-1'
                }`}
              >
                {!isSelected && (
                  <span
                    aria-hidden='true'
                    className='absolute inset-0 bg-[#d67878] opacity-0 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-25'
                  />
                )}
                {isSelected && (
                  <span
                    aria-hidden='true'
                    className='absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#7f242a]'
                  />
                )}
                <CropMarks fadeOnHover />
                <span
                  className={`relative block truncate text-[0.62rem] font-medium tracking-[0.08em] whitespace-nowrap uppercase ${
                    isSelected ? 'text-[#7f242a]' : 'text-[#24211d]'
                  }`}
                  style={{
                    transform: 'rotate(-90deg)',
                    maxWidth: `${size.labelMaxWidth}px`,
                  }}
                >
                  {entry.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-hidden='true' className='border-t border-[#d9d2c7]' />

      {selectedEntry && (
        <article
          className='relative mt-8 flex flex-col gap-3 border border-[#d9d2c7] p-5 pt-7 sm:p-6 sm:pt-8'
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(217,210,199,0.55) 27px, rgba(217,210,199,0.55) 28px)',
          }}
        >
          <CropMarks />

          <span
            aria-hidden='true'
            className='absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-[#d9d2c7] bg-[rgb(248,248,246)]'
          />

          <span className='absolute top-2 end-5 text-[0.65rem] tracking-wide text-[#a39a8d] sm:end-6'>
            {getCallNumber(view, selectedEntry.format ?? '', selectedIndex)}
          </span>

          <div className='flex items-start justify-between gap-3'>
            <h2 className='text-lg leading-6 font-semibold text-black underline decoration-[#7f242a]/40 underline-offset-4 sm:text-xl sm:leading-7'>
              {selectedEntry.title}
            </h2>
            {selectedEntry.format && (
              <span className='shrink-0 text-[0.7rem] font-extrabold tracking-wide text-[#7f242a] uppercase sm:text-xs'>
                {selectedEntry.format}
              </span>
            )}
          </div>

          {(selectedEntry.author || selectedEntry.publisher) && (
            <p className='text-sm text-[#777066]'>
              {[selectedEntry.author, selectedEntry.publisher]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          {selectedEntry.description && (
            <p className='text-sm leading-6 text-[rgb(54,54,54)] sm:text-base sm:leading-7'>
              {selectedEntry.description}
            </p>
          )}

          {selectedEntry.citation && (
            <p className='text-xs leading-5 text-[#a39a8d] italic sm:text-sm'>
              {selectedEntry.citation}
            </p>
          )}

          {selectedEntry.links && selectedEntry.links.length > 0 && (
            <div className='mt-1 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-[#d9d2c7] pt-3'>
              {selectedEntry.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 text-sm text-[#7f242a] underline decoration-[#7f242a]/40 underline-offset-4 transition-colors hover:text-black'
                >
                  {link.label}
                  <span aria-hidden='true'>↗</span>
                </a>
              ))}
            </div>
          )}
        </article>
      )}
    </section>
  );
}

export default function LibraryView({ entriesByLanguage }: LibraryViewProps) {
  const { lang, dict } = useLocale();
  const [view, setView] = useState<ViewMode>(lang === 'fa' ? 'fa' : 'en');
  const entries = entriesByLanguage[view];
  const groups = useMemo(() => groupByFormat(entries, view), [entries, view]);

  return (
    <div>
      <div
        role='tablist'
        aria-label={dict.library.tabsAriaLabel}
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
              {dict.library.tabs[mode]}
            </button>
          );
        })}
      </div>

      <p className='mt-6 flex items-center gap-2 text-sm leading-6 text-[#4f4a43]'>
        <svg aria-hidden='true' viewBox='0 0 10 10' className='h-2.5 w-2.5 shrink-0 text-[#7f242a]'>
          <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
        </svg>
        {formatLocaleNumber(entries.length, lang)}{' '}
        {entries.length === 1
          ? dict.library.resultCount
          : dict.library.resultCountPlural}
      </p>

      <div dir={view === 'fa' ? 'rtl' : 'ltr'} className='pb-24'>
        {groups.map((group) => (
          <Shelf key={group.format} group={group} view={view} />
        ))}
      </div>
    </div>
  );
}
