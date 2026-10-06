'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useLocale } from './LocaleProvider';
import { localizeHref } from '@/lib/i18n';

type RepositoryCard = {
  slug: string;
  title: string;
  artists: string[];
  previewText: string;
  imageAlt: string;
  imageSrc: string;
};

type ThreadPoint = {
  x: number;
  y: number;
};

type DragState = {
  slug: string;
  pointerId: number;
  startX: number;
  startY: number;
  origin: ThreadPoint;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  moved: boolean;
};

// Pointer movement (px) before a press on a card counts as a drag, not a click.
const dragThreshold = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type AnchorPoint = {
  xPercent: number;
  yPercent: number;
};

type RepositoryMasonryProps = {
  projects: RepositoryCard[];
  layoutSeed: number;
};

type ScatterItem = {
  x: number;
  y: number;
  width: number;
};

type ScatterLayout = {
  items: ScatterItem[];
  height: number;
};

// Card width ranges (as % of the container) for base, sm, lg and xl screens.
// Minimums keep the smallest card around 150px wide at each breakpoint.
const scatterBreakpoints = [
  { minWidth: 50, maxWidth: 64, gap: 3 },
  { minWidth: 30, maxWidth: 38, gap: 2.5 },
  { minWidth: 19, maxWidth: 25, gap: 2 },
  { minWidth: 14, maxWidth: 19, gap: 1.6 },
];

const aspectRatios = [
  { className: 'aspect-[4/5]', heightRatio: 5 / 4 },
  { className: 'aspect-[1/1]', heightRatio: 1 },
  { className: 'aspect-[5/4]', heightRatio: 4 / 5 },
];

function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Places cards at random non-overlapping positions. All values are in units of
// the container width, so the layout scales without measuring the DOM.
function buildScatterLayout(
  heightRatios: number[],
  seed: number,
  { minWidth, maxWidth, gap }: (typeof scatterBreakpoints)[number]
): ScatterLayout {
  const random = createRandom(seed);
  const widths = heightRatios.map(
    () => minWidth + random() * (maxWidth - minWidth)
  );
  const totalArea = widths.reduce(
    (sum, width, index) =>
      sum + (width + gap) * (width * heightRatios[index] + gap),
    0
  );
  let fieldHeight = Math.max(totalArea / (100 * 0.42), 1);
  const items: ScatterItem[] = [];

  widths.forEach((width, index) => {
    const height = width * heightRatios[index];
    let placed: ScatterItem | null = null;

    while (!placed) {
      for (let attempt = 0; attempt < 400 && !placed; attempt += 1) {
        const candidate = {
          x: random() * (100 - width),
          y: random() * Math.max(fieldHeight - height, 0),
          width,
        };
        const overlaps = items.some((item, itemIndex) => {
          const itemHeight = item.width * heightRatios[itemIndex];

          return (
            candidate.x < item.x + item.width + gap &&
            candidate.x + width + gap > item.x &&
            candidate.y < item.y + itemHeight + gap &&
            candidate.y + height + gap > item.y
          );
        });

        if (!overlaps) {
          placed = candidate;
        }
      }

      if (!placed) {
        fieldHeight *= 1.1;
      }
    }

    items.push(placed);
  });

  const height = items.reduce(
    (max, item, index) =>
      Math.max(max, item.y + item.width * heightRatios[index]),
    0
  );

  return { items, height };
}

const anchorPoints: AnchorPoint[] = [
  { xPercent: 42, yPercent: 28 },
  { xPercent: 64, yPercent: 37 },
  { xPercent: 31, yPercent: 58 },
  { xPercent: 72, yPercent: 52 },
  { xPercent: 48, yPercent: 69 },
  { xPercent: 24, yPercent: 41 },
  { xPercent: 58, yPercent: 24 },
  { xPercent: 76, yPercent: 64 },
  { xPercent: 36, yPercent: 73 },
  { xPercent: 52, yPercent: 45 },
];

function getAnchorIndex(index: number, layoutSeed: number) {
  return (index * 3 + layoutSeed) % anchorPoints.length;
}

export default function RepositoryMasonry({
  projects,
  layoutSeed,
}: RepositoryMasonryProps) {
  const { lang, dict } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [threadPoints, setThreadPoints] = useState<ThreadPoint[]>([]);
  const [dragOffsets, setDragOffsets] = useState<Record<string, ThreadPoint>>(
    {}
  );
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const aspectIndexes = useMemo(
    () =>
      projects.map((_, index) => {
        const layoutIndex = (index * 7 + layoutSeed) % 9;

        return layoutIndex % 5 === 0 ? 0 : layoutIndex % 3 === 0 ? 1 : 2;
      }),
    [projects, layoutSeed]
  );
  const layouts = useMemo(() => {
    const heightRatios = aspectIndexes.map(
      (aspectIndex) => aspectRatios[aspectIndex].heightRatio
    );

    return scatterBreakpoints.map((breakpoint, breakpointIndex) =>
      buildScatterLayout(
        heightRatios,
        layoutSeed + breakpointIndex * 7919,
        breakpoint
      )
    );
  }, [aspectIndexes, layoutSeed]);

  const measureThreadPoints = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const points = cardRefs.current
      .map((card, index) => {
        if (!card) {
          return null;
        }

        const rect = card.getBoundingClientRect();
        const anchor = anchorPoints[getAnchorIndex(index, layoutSeed)];

        return {
          x: rect.left - containerRect.left + rect.width * (anchor.xPercent / 100),
          y: rect.top - containerRect.top + rect.height * (anchor.yPercent / 100),
        };
      })
      .filter((point): point is ThreadPoint => point !== null);

    setThreadPoints(points);
  }, [layoutSeed]);

  useEffect(() => {
    measureThreadPoints();

    const resizeObserver = new ResizeObserver(measureThreadPoints);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    cardRefs.current.forEach((card) => {
      if (card) {
        resizeObserver.observe(card);
      }
    });

    window.addEventListener('resize', measureThreadPoints);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureThreadPoints);
    };
  }, [projects, measureThreadPoints]);

  useEffect(() => {
    measureThreadPoints();
  }, [dragOffsets, measureThreadPoints]);

  const handlePointerDown = (
    event: PointerEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    const container = containerRef.current;

    if (event.button !== 0 || !container) {
      return;
    }

    const cardRect = event.currentTarget.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const origin = dragOffsets[slug] ?? { x: 0, y: 0 };

    dragRef.current = {
      slug,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      minX: origin.x - (cardRect.left - containerRect.left),
      maxX: origin.x + (containerRect.right - cardRect.right),
      minY: origin.y - (cardRect.top - containerRect.top),
      maxY: origin.y + (containerRect.bottom - cardRect.bottom),
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.moved) {
      if (Math.hypot(deltaX, deltaY) < dragThreshold) {
        return;
      }

      drag.moved = true;
      setStackOrder((order) => [
        ...order.filter((slug) => slug !== drag.slug),
        drag.slug,
      ]);
    }

    setDragOffsets((offsets) => ({
      ...offsets,
      [drag.slug]: {
        x: clamp(drag.origin.x + deltaX, drag.minX, drag.maxX),
        y: clamp(drag.origin.y + deltaY, drag.minY, drag.maxY),
      },
    }));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLAnchorElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    suppressClickRef.current = drag.moved;
    dragRef.current = null;
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
    }
  };

  const threadPath = threadPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  if (projects.length === 0) {
    return (
      <p className='mt-10 pb-16 text-sm leading-6 text-[#777066]'>
        {dict.common.noProjects}
      </p>
    );
  }

  return (
    <div ref={containerRef} className='relative mt-10 pb-16 sm:mt-12'>
      <section
        className='relative z-10 h-0 pb-[var(--field-h0)] sm:pb-[var(--field-h1)] lg:pb-[var(--field-h2)] xl:pb-[var(--field-h3)]'
        style={
          Object.fromEntries(
            layouts.map((layout, index) => [
              `--field-h${index}`,
              `${layout.height}%`,
            ])
          ) as CSSProperties
        }
      >
        {projects.map((project, index) => {
          const aspectClass = aspectRatios[aspectIndexes[index]].className;
          const positionStyle = Object.fromEntries(
            layouts.flatMap((layout, layoutIndex) => {
              const item = layout.items[index];

              return [
                [`--x${layoutIndex}`, `${item.x}%`],
                [`--y${layoutIndex}`, `${(item.y / layout.height) * 100}%`],
                [`--w${layoutIndex}`, `${item.width}%`],
              ];
            })
          ) as CSSProperties;
          const offset = dragOffsets[project.slug];
          const stackIndex = stackOrder.indexOf(project.slug);

          if (offset) {
            positionStyle.transform = `translate(${offset.x}px, ${offset.y}px)`;
          }

          if (stackIndex !== -1) {
            positionStyle.zIndex = stackIndex + 1;
          }

          return (
            <Link
              key={project.slug}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              href={localizeHref(lang, `/repository/${project.slug}`)}
              style={positionStyle}
              draggable={false}
              onPointerDown={(event) => handlePointerDown(event, project.slug)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onClick={handleClick}
              className='group absolute cursor-grab select-none active:cursor-grabbing sm:touch-none left-[var(--x0)] top-[var(--y0)] block w-[var(--w0)] overflow-hidden sm:left-[var(--x1)] sm:top-[var(--y1)] sm:w-[var(--w1)] lg:left-[var(--x2)] lg:top-[var(--y2)] lg:w-[var(--w2)] xl:left-[var(--x3)] xl:top-[var(--y3)] xl:w-[var(--w3)]'
            >
              <div className={`relative w-full ${aspectClass}`}>
                <Image
                  src={project.imageSrc}
                  alt={project.imageAlt}
                  fill
                  draggable={false}
                  sizes='(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 38vw, 64vw'
                  className='object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110'
                />
                <div className='absolute inset-0 bg-[#d67878]/68 mix-blend-multiply transition-colors duration-500 group-hover:bg-[#f8f8f6]/88 group-hover:mix-blend-normal' />
                <div className='absolute inset-0 bg-black/20 mix-blend-color-burn transition-opacity duration-500 group-hover:opacity-0' />
                <div
                  aria-hidden='true'
                  className='absolute inset-0 opacity-25 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0'
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
                    backgroundSize: '4px 4px',
                  }}
                />
                <div className='absolute inset-0 flex flex-col justify-end gap-1 p-2.5 sm:p-3'>
                  <h2 className='text-[0.85rem] font-semibold leading-[1.15rem] sm:text-[0.95rem] sm:leading-5 text-white transition-colors duration-500 group-hover:text-[#7f242a]'>
                    {project.title}
                  </h2>
                  {project.artists.length > 0 && (
                    <p className='text-[0.72rem] leading-4 text-white/90 sm:text-[0.78rem] transition-colors duration-500 group-hover:text-[#7f242a]'>
                      {project.artists.join(', ')}
                    </p>
                  )}
                  {project.previewText && (
                    <p className='mt-0.5 line-clamp-2 text-[0.7rem] leading-4 text-white/90 opacity-0 transition duration-500 group-hover:opacity-100 group-hover:text-[#7f242a]'>
                      {project.previewText}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <svg
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-20 h-full w-full'
      >
        <g
          fill='none'
          stroke='#7f242a'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='0.5'
          vectorEffect='non-scaling-stroke'
        >
          {threadPath && <path d={threadPath} />}
        </g>
      </svg>
    </div>
  );
}
