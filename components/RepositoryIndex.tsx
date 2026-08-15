'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';
import { getDirection, localizeHref } from '@/lib/i18n';
import HoverPreviewCanvas from './HoverPreviewCanvas';

type RepositoryCard = {
  slug: string;
  title: string;
  artists: string[];
  previewText: string;
  imageAlt: string;
  imageSrc: string;
};

type RepositoryIndexProps = {
  projects: RepositoryCard[];
};

type Group = {
  letter: string;
  items: RepositoryCard[];
};

const PREVIEW_WIDTH = 260;
const PREVIEW_MIN_HEIGHT = 180;
const PREVIEW_MAX_HEIGHT = 340;
const CURSOR_OFFSET = 30;

function groupAlphabetically(projects: RepositoryCard[], lang: string): Group[] {
  const collator = new Intl.Collator(lang, { sensitivity: 'base' });
  const sorted = [...projects].sort((a, b) => collator.compare(a.title, b.title));
  const groups: Group[] = [];

  for (const project of sorted) {
    const letter = project.title.trim().charAt(0).toUpperCase() || '#';
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.letter === letter) {
      lastGroup.items.push(project);
    } else {
      groups.push({ letter, items: [project] });
    }
  }

  return groups;
}

export default function RepositoryIndex({ projects }: RepositoryIndexProps) {
  const { lang, dict } = useLocale();
  const isRtl = getDirection(lang) === 'rtl';
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [previewAspect, setPreviewAspect] = useState(1.2);
  const floatingRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const previewHeightRef = useRef(PREVIEW_WIDTH / 1.2);
  const anchorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setIsTouchDevice(!mediaQuery.matches);

    sync();
    mediaQuery.addEventListener('change', sync);

    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  const previewHeight = Math.min(
    PREVIEW_MAX_HEIGHT,
    Math.max(PREVIEW_MIN_HEIGHT, PREVIEW_WIDTH / previewAspect)
  );

  // Read by the mousemove handler below without re-registering it on every
  // aspect change.
  useEffect(() => {
    previewHeightRef.current = previewHeight;
  }, [previewHeight]);

  // Moves the floating card and its red thread directly via the DOM (no
  // React state) so both track the cursor at native pointer speed. The card
  // flips to the opposite side of the cursor when it would overflow the
  // viewport, and the thread is redrawn every frame from the last-hovered
  // row to the card's near corner — the same connecting-line device the
  // gallery tab uses between its own scattered images.
  useEffect(() => {
    const node = floatingRef.current;
    const thread = threadRef.current;

    if (!node) {
      return;
    }

    const updatePosition = (event: MouseEvent) => {
      const height = previewHeightRef.current;

      // The card prefers to sit on the "ahead" side of the cursor relative
      // to reading direction — after it in LTR, before it in RTL — and only
      // flips to the other side when that would run off the viewport.
      const preferredLeft = isRtl
        ? event.clientX - CURSOR_OFFSET - PREVIEW_WIDTH
        : event.clientX + CURSOR_OFFSET;
      const preferredOverflows = isRtl
        ? preferredLeft < 8
        : preferredLeft + PREVIEW_WIDTH > window.innerWidth - 8;
      const rawLeft = preferredOverflows
        ? isRtl
          ? event.clientX + CURSOR_OFFSET
          : event.clientX - CURSOR_OFFSET - PREVIEW_WIDTH
        : preferredLeft;

      const overflowsBottom =
        event.clientY + CURSOR_OFFSET + height > window.innerHeight;
      const top = overflowsBottom
        ? event.clientY - CURSOR_OFFSET - height
        : event.clientY + CURSOR_OFFSET;

      const clampedLeft = Math.max(
        8,
        Math.min(rawLeft, window.innerWidth - PREVIEW_WIDTH - 8)
      );
      const clampedTop = Math.max(8, top);

      node.style.transform = `translate3d(${clampedLeft}px, ${clampedTop}px, 0)`;

      if (thread) {
        const anchor = anchorRef.current;
        // The thread should meet whichever edge of the card actually ended
        // up nearest the cursor, regardless of which side it landed on.
        const cornerX =
          Math.abs(clampedLeft - event.clientX) <
          Math.abs(clampedLeft + PREVIEW_WIDTH - event.clientX)
            ? clampedLeft
            : clampedLeft + PREVIEW_WIDTH;
        const cornerY =
          Math.abs(clampedTop - event.clientY) <
          Math.abs(clampedTop + height - event.clientY)
            ? clampedTop
            : clampedTop + height;
        // A taut ruler-straight line reads as a UI connector; a slight
        // gravity droop reads as an actual length of thread pinned at both
        // ends, so the curve sags in proportion to how far it spans.
        const midX = (anchor.x + cornerX) / 2;
        const midY = (anchor.y + cornerY) / 2;
        const span = Math.hypot(cornerX - anchor.x, cornerY - anchor.y);
        const sag = Math.min(span * 0.14, 46);
        thread.setAttribute(
          'd',
          `M ${anchor.x} ${anchor.y} Q ${midX} ${midY + sag} ${cornerX} ${cornerY}`
        );
      }
    };

    window.addEventListener('mousemove', updatePosition);

    return () => window.removeEventListener('mousemove', updatePosition);
  }, [isRtl]);

  const groups = useMemo(
    () => groupAlphabetically(projects, lang),
    [projects, lang]
  );
  const hoveredProject =
    projects.find((project) => project.slug === hoveredSlug) ?? null;
  const isPreviewVisible = Boolean(hoveredProject) && !isTouchDevice;

  const handleRowActivate = (
    project: RepositoryCard,
    event: { currentTarget: HTMLElement }
  ) => {
    setHoveredSlug(project.slug);

    const rect = event.currentTarget.getBoundingClientRect();
    anchorRef.current = {
      x: isRtl ? rect.right - 4 : rect.left + 4,
      y: rect.top + rect.height / 2,
    };
  };

  if (projects.length === 0) {
    return (
      <p className='mt-10 pb-16 text-sm leading-6 text-[#777066]'>
        {dict.common.noProjects}
      </p>
    );
  }

  return (
    <div className='mt-10 pb-16 sm:mt-12'>
      <p className='mb-6 hidden text-xs uppercase tracking-[0.14em] text-[#a39a8d] lg:block'>
        {isTouchDevice ? dict.repository.indexHintTouch : dict.repository.indexHint}
      </p>

      <div
        onMouseLeave={() => setHoveredSlug(null)}
        className='columns-1 gap-x-10 sm:columns-2 xl:columns-3'
      >
        {groups.map((group) => (
          <div
            key={group.letter}
            className='break-inside-avoid-column border-t border-[#d9d2c7] py-3 first:border-t-0'
          >
            <span
              aria-hidden='true'
              className='block text-lg font-semibold tracking-wide text-[#7f242a] sm:text-xl'
            >
              {group.letter}
            </span>
            <ul className='divide-y divide-[#d9d2c7]/70'>
              {group.items.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={localizeHref(lang, `/repository/${project.slug}`)}
                    onMouseEnter={(event) => handleRowActivate(project, event)}
                    onFocus={(event) => handleRowActivate(project, event)}
                    className='group flex min-w-0 flex-col py-2.5 sm:py-3'
                  >
                    <span className='truncate text-[1rem] font-medium text-[rgb(54,54,54)] transition-colors group-hover:text-[#7f242a] sm:text-[1.1rem]'>
                      {project.title}
                    </span>
                    {project.artists.length > 0 && (
                      <span className='truncate text-[0.8rem] text-[#777066]'>
                        {project.artists.join(', ')}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <svg
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 z-40 hidden h-full w-full lg:block'
      >
        <path
          ref={threadRef}
          fill='none'
          stroke='#7f242a'
          strokeWidth='1'
          strokeLinecap='round'
          className={`transition-opacity duration-150 ${
            isPreviewVisible ? 'opacity-70' : 'opacity-0'
          }`}
        />
      </svg>

      <div
        ref={floatingRef}
        aria-hidden='true'
        className={`pointer-events-none fixed left-0 top-0 z-50 hidden lg:block ${
          isPreviewVisible ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-150`}
        style={{ width: PREVIEW_WIDTH, height: previewHeight }}
      >
        {/* Print registration ticks, like crop marks on an unfinished
            proof — a nod to the halftone/print language of the shader. */}
        {[
          '-top-1.5 -left-1.5',
          '-top-1.5 -right-1.5',
          '-bottom-1.5 -left-1.5',
          '-bottom-1.5 -right-1.5',
        ].map((position) => (
          <svg
            key={position}
            aria-hidden='true'
            viewBox='0 0 10 10'
            className={`absolute h-2.5 w-2.5 text-[#7f242a] ${position}`}
          >
            <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
          </svg>
        ))}
        <HoverPreviewCanvas
          src={hoveredProject?.imageSrc ?? null}
          alt={hoveredProject?.imageAlt ?? ''}
          title={hoveredProject?.title ?? ''}
          artists={hoveredProject?.artists ?? []}
          onAspectChange={setPreviewAspect}
        />
      </div>
    </div>
  );
}
