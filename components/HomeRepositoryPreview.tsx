import Image from 'next/image';
import Link from 'next/link';

type HomePreviewProject = {
  slug: string;
  imageAlt: string;
  imageSrc: string;
};

type HomeRepositoryPreviewProps = {
  projects: HomePreviewProject[];
};

const positions = [
  { x: 6, y: 14, w: 30, a: 'aspect-[4/5]', z: 9 },
  { x: 29, y: 7, w: 25, a: 'aspect-[5/4]', z: 7 },
  { x: 50, y: 15, w: 32, a: 'aspect-[1/1]', z: 8 },
  { x: 18, y: 39, w: 28, a: 'aspect-[5/4]', z: 10 },
  { x: 41, y: 35, w: 26, a: 'aspect-[4/5]', z: 11 },
  { x: 63, y: 38, w: 29, a: 'aspect-[5/4]', z: 9 },
  { x: 4, y: 64, w: 26, a: 'aspect-[1/1]', z: 6 },
  { x: 25, y: 67, w: 31, a: 'aspect-[5/4]', z: 12 },
  { x: 54, y: 63, w: 27, a: 'aspect-[4/5]', z: 7 },
  { x: 73, y: 61, w: 23, a: 'aspect-[1/1]', z: 10 },
  { x: 35, y: 20, w: 21, a: 'aspect-[1/1]', z: 13 },
  { x: 66, y: 7, w: 24, a: 'aspect-[4/5]', z: 6 },
  { x: 11, y: 26, w: 23, a: 'aspect-[5/4]', z: 14 },
];

function getPosition(index: number) {
  return positions[index % positions.length];
}

function getNodePoint(index: number) {
  const position = getPosition(index);

  return {
    x: position.x + position.w * 0.58,
    y: position.y + position.w * 0.38,
  };
}

export default function HomeRepositoryPreview({
  projects,
}: HomeRepositoryPreviewProps) {
  const path = projects
    .map((_, index) => {
      const point = getNodePoint(index);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ');

  return (
    <Link
      href='/repository'
      aria-label='Open Bast repository'
      className='group relative block min-h-[32rem] overflow-hidden border border-black/10 bg-[#f8f8f6] sm:min-h-[38rem] lg:min-h-[calc(100dvh-9rem)]'
    >
      <svg
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-30 h-full w-full'
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
      >
        <g
          fill='none'
          stroke='#b33f3f'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='0.18'
          vectorEffect='non-scaling-stroke'
        >
          {path && <path d={path} />}
          {projects.slice(0, -2).map((_, index) => {
            const firstPoint = getNodePoint(index);
            const secondPoint = getNodePoint(index + 2);

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
        const position = getPosition(index);
        const point = getNodePoint(index);

        return (
          <div
            key={project.slug}
            className={`absolute ${position.a} transition-transform duration-500 group-hover:scale-[1.025]`}
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
            />
            <div className='absolute inset-0 bg-[#d67878]/72' />
            <span
              className='absolute z-40 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b33f3f]'
              style={{
                left: `${((point.x - position.x) / position.w) * 100}%`,
                top: `${((point.y - position.y) / position.w) * 100}%`,
              }}
            />
          </div>
        );
      })}
    </Link>
  );
}
