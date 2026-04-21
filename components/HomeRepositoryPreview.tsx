'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { PointerEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

type HomePreviewProject = {
  slug: string;
  imageAlt: string;
  imageSrc: string;
};

type HomeRepositoryPreviewProps = {
  projects: HomePreviewProject[];
};

const positions = [
  { x: 47, y: 12, w: 17, a: 'aspect-[4/5]', z: 9 },
  { x: 62, y: 7, w: 15, a: 'aspect-[5/4]', z: 7 },
  { x: 75, y: 15, w: 18, a: 'aspect-[1/1]', z: 8 },
  { x: 55, y: 38, w: 16, a: 'aspect-[5/4]', z: 10 },
  { x: 67, y: 34, w: 15, a: 'aspect-[4/5]', z: 11 },
  { x: 81, y: 38, w: 17, a: 'aspect-[5/4]', z: 9 },
  { x: 46, y: 63, w: 15, a: 'aspect-[1/1]', z: 6 },
  { x: 59, y: 66, w: 18, a: 'aspect-[5/4]', z: 12 },
  { x: 76, y: 62, w: 16, a: 'aspect-[4/5]', z: 7 },
  { x: 88, y: 60, w: 13, a: 'aspect-[1/1]', z: 10 },
  { x: 66, y: 20, w: 12, a: 'aspect-[1/1]', z: 13 },
  { x: 83, y: 7, w: 14, a: 'aspect-[4/5]', z: 6 },
  { x: 50, y: 27, w: 14, a: 'aspect-[5/4]', z: 14 },
];

type PreviewPosition = (typeof positions)[number];

type DragState = {
  index: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

function getInitialPosition(index: number) {
  return positions[index % positions.length];
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
    () => projects.map((_, index) => getInitialPosition(index))
  );
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
      className='group absolute inset-0 z-20 cursor-pointer overflow-hidden outline-none'
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
          strokeWidth='0.18'
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
            className={`absolute ${position.a} cursor-grab touch-none select-none transition-transform duration-500 active:cursor-grabbing group-hover:scale-[1.025]`}
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
              sizes='(min-width: 1024px) 24vw, 44vw'
              className='object-cover'
              draggable={false}
            />
            <div className='absolute inset-0 bg-[#7f242a]/72' />
          </div>
        );
      })}
    </div>
  );
}
