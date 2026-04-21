'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type HomePreviewProject = {
  slug: string;
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

function getInitialPositions(count: number, isDesktop: boolean) {
  const sourcePositions = isDesktop ? desktopPositions : mobilePositions;

  return Array.from(
    { length: count },
    (_, index) => sourcePositions[index % sourcePositions.length]
  );
}

function getNodePoint(position: PreviewPosition) {
  const aspectHeightMultiplier =
    position.a === 'aspect-[4/5]' ? 1.25 : position.a === 'aspect-[1/1]' ? 1 : 0.8;

  return {
    x: position.x + position.w * 0.58,
    y: position.y + position.w * aspectHeightMultiplier * 0.38,
  };
}

export default function HomeRepositoryPreview({
  projects,
}: HomeRepositoryPreviewProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [previewPositions, setPreviewPositions] = useState<PreviewPosition[]>(
    () => getInitialPositions(projects.length, true)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncPositions = () => {
      setPreviewPositions(getInitialPositions(projects.length, mediaQuery.matches));
    };

    syncPositions();
    mediaQuery.addEventListener('change', syncPositions);

    return () => {
      mediaQuery.removeEventListener('change', syncPositions);
    };
  }, [projects.length]);
  const points = useMemo(
    () => previewPositions.map((position) => getNodePoint(position)),
    [previewPositions]
  );
  const path = projects
    .map((_, index) => {
      const point = points[index];
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ');

  const openRepository = () => {
    router.push('/repository');
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>,
    index: number
  ) => {
    const position = previewPositions[index];

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

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const container = containerRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const deltaX = ((event.clientX - dragState.startClientX) / containerRect.width) * 100;
    const deltaY = ((event.clientY - dragState.startClientY) / containerRect.height) * 100;

    if (Math.abs(deltaX) > 0.35 || Math.abs(deltaY) > 0.35) {
      dragState.moved = true;
    }

    setPreviewPositions((currentPositions) =>
      currentPositions.map((position, index) => {
        if (index !== dragState.index) {
          return position;
        }

        return {
          ...position,
          x: Math.min(100 - position.w * 0.3, Math.max(-position.w * 0.7, dragState.startX + deltaX)),
          y: Math.min(98, Math.max(-position.w * 0.55, dragState.startY + deltaY)),
        };
      })
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!dragState.moved) {
      openRepository();
    }
  };

  return (
    <div
      ref={containerRef}
      role='link'
      tabIndex={0}
      aria-label='Open Bast repository'
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          openRepository();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openRepository();
        }
      }}
      className='group relative z-20 mt-6 min-h-[34rem] cursor-pointer overflow-hidden outline-none sm:min-h-[42rem] lg:absolute lg:inset-0 lg:mt-0 lg:min-h-0'
    >
      <svg
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-30 h-full w-full'
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
          {projects.slice(0, -2).map((_, index) => {
            const firstPoint = points[index];
            const secondPoint = points[index + 2];

            return (
              <path
                key={`cross-thread-${projects[index].slug}`}
                d={`M ${firstPoint.x} ${firstPoint.y} L ${secondPoint.x} ${secondPoint.y}`}
              />
            );
          })}
        </g>
      </svg>

      {projects.map((project, index) => {
        const position = previewPositions[index];

        return (
          <div
            key={project.slug}
            onPointerDown={(event) => handlePointerDown(event, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              dragStateRef.current = null;
            }}
            className={`absolute ${position.a} cursor-grab touch-none select-none transition-transform duration-500 hover:scale-[1.045] active:cursor-grabbing group-hover:scale-[1.025]`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.w}%`,
              zIndex: position.z,
            }}
          >
            <Image
              src={project.imageSrc}
              alt={project.imageAlt}
              fill
              sizes='(min-width: 1024px) 18vw, 48vw'
              className='object-cover'
              draggable={false}
            />
            <div className='absolute inset-0 bg-[#d67878]/68 mix-blend-multiply' />
            <div className='absolute inset-0 bg-black/20 mix-blend-color-burn' />
            <div
              aria-hidden='true'
              className='absolute inset-0 opacity-25 mix-blend-multiply'
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
                backgroundSize: '4px 4px',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
