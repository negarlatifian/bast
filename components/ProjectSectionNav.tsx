'use client';

import { useEffect, useRef, useState } from 'react';

export type ProjectNavSection = {
  id: string;
  label: string;
};

type ProjectSectionNavProps = {
  sections: ProjectNavSection[];
  ariaLabel: string;
  /** Id of a sentinel element; the nav reveals once it scrolls out of view. */
  revealAfterId?: string;
};

export default function ProjectSectionNav({
  sections,
  ariaLabel,
  revealAfterId,
}: ProjectSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null
  );
  const [isRevealed, setIsRevealed] = useState(!revealAfterId);
  const sectionIds = sections.map((section) => section.id).join('|');

  useEffect(() => {
    if (!revealAfterId) {
      return;
    }

    const sentinel = document.getElementById(revealAfterId);

    if (!sentinel) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRevealed(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [revealAfterId]);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries[0]) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-112px 0px -66% 0px', threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds]);

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    window.history.pushState(null, '', `#${id}`);
    setActiveId(id);
    linkRefs.current[id]?.focus({ preventScroll: true });
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={`no-scrollbar -mx-8 flex gap-6 overflow-x-auto px-8 pb-1 sm:-mx-16 sm:px-16 lg:sticky lg:top-28 lg:mx-0 lg:w-44 lg:shrink-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0 lg:transition-opacity lg:duration-300 ${
        isRevealed ? 'lg:opacity-100' : 'lg:pointer-events-none lg:opacity-0'
      }`}
    >
      {sections.map((section) => {
        const isActive = section.id === activeId;

        return (
          <a
            key={section.id}
            ref={(element) => {
              linkRefs.current[section.id] = element;
            }}
            href={`#${section.id}`}
            aria-current={isActive ? 'location' : undefined}
            onClick={(event) => handleClick(event, section.id)}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-1 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f242a] sm:text-base lg:border-b-0 lg:border-s-2 lg:ps-3 lg:pb-0 ${
              isActive
                ? 'border-[#7f242a] font-semibold text-[#7f242a]'
                : 'border-transparent font-medium text-[rgb(54,54,54)] hover:border-[#7f242a]/40 hover:text-[#7f242a]'
            }`}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
