'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type RepositoryCard = {
  slug: string;
  title: string;
  artists: string[];
  imageAlt: string;
  imageSrc: string;
};

type ThreadPoint = {
  x: number;
  y: number;
};

type AnchorPoint = {
  xPercent: number;
  yPercent: number;
};

type RepositoryMasonryProps = {
  projects: RepositoryCard[];
  layoutSeed: number;
};

const scatterClasses = [
  'w-[88%] sm:w-[44%] lg:w-[29%] lg:ml-[3%]',
  'ml-auto mt-8 w-[76%] sm:mt-16 sm:w-[38%] lg:ml-[7%] lg:mt-24 lg:w-[24%]',
  'mt-4 w-[92%] sm:ml-[12%] sm:mt-2 sm:w-[46%] lg:ml-auto lg:mt-8 lg:w-[31%]',
  'ml-[10%] mt-10 w-[72%] sm:ml-0 sm:mt-20 sm:w-[36%] lg:ml-[12%] lg:mt-4 lg:w-[25%]',
  'ml-auto mt-3 w-[86%] sm:ml-auto sm:mt-8 sm:w-[47%] lg:ml-[6%] lg:mt-20 lg:w-[28%]',
  'mt-12 w-[78%] sm:ml-[8%] sm:mt-0 sm:w-[39%] lg:ml-auto lg:mt-10 lg:w-[23%]',
  'ml-[6%] mt-2 w-[90%] sm:ml-auto sm:mt-14 sm:w-[42%] lg:ml-[2%] lg:mt-28 lg:w-[30%]',
  'ml-auto mt-10 w-[74%] sm:ml-[3%] sm:mt-4 sm:w-[35%] lg:ml-[10%] lg:mt-2 lg:w-[24%]',
  'mt-5 w-[84%] sm:ml-auto sm:mt-24 sm:w-[49%] lg:ml-auto lg:mt-20 lg:w-[32%]',
];

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [threadPoints, setThreadPoints] = useState<ThreadPoint[]>([]);

  useEffect(() => {
    const measureThreadPoints = () => {
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
    };

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
  }, [projects, layoutSeed]);

  const threadPath = threadPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const crossThreads = threadPoints
    .map((point, index) => {
      const nextPoint = threadPoints[index + 2];

      if (!nextPoint) {
        return null;
      }

      return (
        <path
          key={`${point.x}-${point.y}-${nextPoint.x}-${nextPoint.y}`}
          d={`M ${point.x} ${point.y} L ${nextPoint.x} ${nextPoint.y}`}
        />
      );
    })
    .filter(Boolean);

  if (projects.length === 0) {
    return (
      <p className='mt-10 pb-16 text-sm leading-6 text-[#777066]'>
        No projects found.
      </p>
    );
  }

  return (
    <div ref={containerRef} className='relative mt-10 pb-16 sm:mt-12'>
      <section className='relative z-10 flex flex-wrap items-start gap-x-5 gap-y-4 sm:gap-x-7 sm:gap-y-2 lg:gap-x-8'>
        {projects.map((project, index) => {
          const layoutIndex =
            (index * 7 + layoutSeed) % scatterClasses.length;
          const aspectClass =
            layoutIndex % 5 === 0
              ? 'aspect-[4/5]'
              : layoutIndex % 3 === 0
                ? 'aspect-[1/1]'
                : 'aspect-[5/4]';

          return (
            <Link
              key={project.slug}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              href={`/repository/${project.slug}`}
              className={`group relative block shrink-0 overflow-hidden ${
                scatterClasses[layoutIndex]
              }`}
            >
              <div className={`relative w-full ${aspectClass}`}>
                <Image
                  src={project.imageSrc}
                  alt={project.imageAlt}
                  fill
                  sizes='(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw'
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
                <div className='absolute inset-0 flex flex-col justify-end gap-2 p-4'>
                  <h2 className='text-[1.15rem] font-semibold leading-6 text-white transition-colors duration-500 group-hover:text-[#7f242a]'>
                    {project.title}
                  </h2>
                  {project.artists.length > 0 && (
                    <p className='text-[0.92rem] leading-5 text-white/90 transition-colors duration-500 group-hover:text-[#7f242a]'>
                      {project.artists.join(', ')}
                    </p>
                  )}
                  <span className='mt-2 inline-flex items-center gap-2 text-[0.92rem] font-medium leading-5 text-[#7f242a] opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
                    Read more
                    <span aria-hidden='true'>→</span>
                  </span>
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
          strokeWidth='1'
          vectorEffect='non-scaling-stroke'
        >
          {threadPath && <path d={threadPath} />}
          {crossThreads}
        </g>
      </svg>
    </div>
  );
}
