'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent, PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';
import { getDirection, localizeHref } from '@/lib/i18n';

type HomePreviewProject = {
  slug: string;
  title: string;
  imageAlt: string;
  imageSrc: string;
};

type HomeRepositoryPreviewProps = {
  projects: HomePreviewProject[];
};

const desktopPositions = [
  { x: 56, y: 12, w: 14, a: 'aspect-[4/5]', z: 9 },
  { x: 68, y: 7, w: 13, a: 'aspect-[5/4]', z: 7 },
  { x: 79, y: 15, w: 15, a: 'aspect-[1/1]', z: 8 },
  { x: 59, y: 38, w: 13, a: 'aspect-[5/4]', z: 10 },
  { x: 70, y: 34, w: 13, a: 'aspect-[4/5]', z: 11 },
  { x: 84, y: 38, w: 13, a: 'aspect-[5/4]', z: 9 },
  { x: 55, y: 63, w: 13, a: 'aspect-[1/1]', z: 6 },
  { x: 66, y: 66, w: 15, a: 'aspect-[5/4]', z: 12 },
  { x: 78, y: 62, w: 13, a: 'aspect-[4/5]', z: 7 },
  { x: 88, y: 60, w: 11, a: 'aspect-[1/1]', z: 10 },
  { x: 72, y: 20, w: 11, a: 'aspect-[1/1]', z: 13 },
  { x: 86, y: 7, w: 11, a: 'aspect-[4/5]', z: 6 },
  { x: 57, y: 27, w: 12, a: 'aspect-[5/4]', z: 14 },
];

const mobilePositions = [
  { x: 2, y: 8, w: 42, a: 'aspect-[4/5]', z: 9 },
  { x: 33, y: 3, w: 37, a: 'aspect-[5/4]', z: 7 },
  { x: 58, y: 13, w: 40, a: 'aspect-[1/1]', z: 8 },
  { x: 6, y: 34, w: 39, a: 'aspect-[5/4]', z: 10 },
  { x: 40, y: 31, w: 36, a: 'aspect-[4/5]', z: 11 },
  { x: 66, y: 39, w: 34, a: 'aspect-[5/4]', z: 9 },
  { x: 0, y: 62, w: 35, a: 'aspect-[1/1]', z: 6 },
  { x: 30, y: 68, w: 42, a: 'aspect-[5/4]', z: 12 },
  { x: 58, y: 62, w: 37, a: 'aspect-[4/5]', z: 7 },
  { x: 4, y: 78, w: 34, a: 'aspect-[1/1]', z: 10 },
  { x: 34, y: 20, w: 31, a: 'aspect-[1/1]', z: 13 },
  { x: 72, y: 4, w: 30, a: 'aspect-[4/5]', z: 6 },
  { x: 10, y: 22, w: 36, a: 'aspect-[5/4]', z: 14 },
];

type PreviewPosition = (typeof desktopPositions)[number];

type DragState = {
  index: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

// Where the visitor has dragged each fragment, keyed to the layout it was
// dragged in so a breakpoint or direction change starts from a clean scatter.
type DraggedPositions = {
  layoutKey: string;
  byIndex: Record<number, { x: number; y: number }>;
};

// The image cluster is anchored to the right (x 55-88%) so it sits beside
// left-aligned hero text. Under RTL the hero text flips to the right (it
// uses logical `items-start` alignment), so the cluster must mirror to the
// left to avoid covering it.
function mirrorPosition(position: PreviewPosition): PreviewPosition {
  return { ...position, x: 100 - position.x - position.w };
}

function getPositions(count: number, isDesktop: boolean, mirror: boolean) {
  const sourcePositions = isDesktop ? desktopPositions : mobilePositions;
  // Cap at one project per fixed slot so entries never stack directly on
  // top of one another.
  const visibleCount = Math.min(count, sourcePositions.length);

  return Array.from({ length: visibleCount }, (_, index) => {
    const position = sourcePositions[index];
    return mirror ? mirrorPosition(position) : position;
  });
}

function getNodePoint(position: PreviewPosition) {
  const aspectHeightMultiplier =
    position.a === 'aspect-[4/5]' ? 1.25 : position.a === 'aspect-[1/1]' ? 1 : 0.8;

  return {
    x: position.x + position.w * 0.58,
    y: position.y + position.w * aspectHeightMultiplier * 0.38,
  };
}

/**
 * A decorative scatter of repository fragments stitched together by a red
 * thread — Bast's visual shorthand for a counter-archive of many voices.
 * Each fragment is a real link to its project (not just a backdrop), so the
 * cluster is fully reachable by keyboard and screen reader, not only by
 * pointer. Fragments can also be dragged around; a drag never counts as a
 * click, so only a plain click follows the link.
 */
export default function HomeRepositoryPreview({
  projects,
}: HomeRepositoryPreviewProps) {
  const { lang } = useLocale();
  const isRtl = getDirection(lang) === 'rtl';
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener('change', sync);

    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const layoutKey = `${isDesktop ? 'desktop' : 'mobile'}-${isRtl ? 'rtl' : 'ltr'}`;
  const [dragged, setDragged] = useState<DraggedPositions>({
    layoutKey,
    byIndex: {},
  });

  const layoutPositions = useMemo(
    () => getPositions(projects.length, isDesktop, isRtl),
    [projects.length, isDesktop, isRtl]
  );
  const positions = useMemo(() => {
    const byIndex = dragged.layoutKey === layoutKey ? dragged.byIndex : {};

    return layoutPositions.map((position, index) =>
      byIndex[index] ? { ...position, ...byIndex[index] } : position
    );
  }, [dragged, layoutKey, layoutPositions]);
  const visibleProjects = projects.slice(0, positions.length);
  const points = useMemo(
    () => positions.map((position) => getNodePoint(position)),
    [positions]
  );
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const handlePointerDown = (
    event: PointerEvent<HTMLAnchorElement>,
    index: number
  ) => {
    // A drag that ended outside the tile never fires its click, so a stale
    // flag would otherwise swallow the next genuine click.
    suppressClickRef.current = false;

    if (event.button !== 0) {
      return;
    }

    const position = positions[index];

    dragStateRef.current = {
      index,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const dragState = dragStateRef.current;
    const container = containerRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const deltaX =
      ((event.clientX - dragState.startClientX) / containerRect.width) * 100;
    const deltaY =
      ((event.clientY - dragState.startClientY) / containerRect.height) * 100;

    if (Math.abs(deltaX) > 0.35 || Math.abs(deltaY) > 0.35) {
      dragState.moved = true;
    }

    const { w } = positions[dragState.index];
    const x = Math.min(100 - w * 0.3, Math.max(-w * 0.7, dragState.startX + deltaX));
    const y = Math.min(98, Math.max(-w * 0.55, dragState.startY + deltaY));

    setDragged((current) => ({
      layoutKey,
      byIndex: {
        ...(current.layoutKey === layoutKey ? current.byIndex : {}),
        [dragState.index]: { x, y },
      },
    }));
  };

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    suppressClickRef.current = dragState.moved;
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
    }
  };

  return (
    <div
      ref={containerRef}
      className='relative z-20 mt-6 min-h-[34rem] sm:min-h-[42rem] lg:absolute lg:inset-0 lg:mt-0 lg:min-h-0'
    >
      <svg
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-10 h-full w-full'
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
      >
        <g
          fill='none'
          stroke='#7f242a'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='0.12'
          vectorEffect='non-scaling-stroke'
        >
          {path && <path d={path} />}
          {visibleProjects.slice(0, -2).map((project, index) => {
            const firstPoint = points[index];
            const secondPoint = points[index + 2];

            return (
              <path
                key={`cross-thread-${project.slug}`}
                d={`M ${firstPoint.x} ${firstPoint.y} L ${secondPoint.x} ${secondPoint.y}`}
              />
            );
          })}
        </g>
      </svg>

      {visibleProjects.map((project, index) => {
        const position = positions[index];

        return (
          <Link
            key={project.slug}
            href={localizeHref(lang, `/repository/${project.slug}`)}
            draggable={false}
            onPointerDown={(event) => handlePointerDown(event, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              dragStateRef.current = null;
            }}
            onClick={handleClick}
            className='group absolute cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:scale-[1.045] motion-safe:focus-visible:scale-[1.045] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f242a]'
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.w}%`,
              zIndex: position.z,
            }}
          >
            <span className={`relative block w-full ${position.a}`}>
              <Image
                src={project.imageSrc}
                alt={project.imageAlt || project.title}
                fill
                sizes='(min-width: 1024px) 18vw, 48vw'
                className='object-cover'
                draggable={false}
              />
              <span className='absolute inset-0 bg-[#d67878]/68 mix-blend-multiply' />
              <span className='absolute inset-0 bg-black/20 mix-blend-color-burn' />
              <span
                aria-hidden='true'
                className='absolute inset-0 opacity-25 mix-blend-multiply'
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
                  backgroundSize: '4px 4px',
                }}
              />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
