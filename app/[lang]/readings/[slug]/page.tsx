import MainLayout from '@/components/MainLayout';
import {
  getProjectReReading,
  getProjectReReadings,
  getReReadingParagraphs,
} from '@/data/rereading';
import { getProjectBySlug, localizeProject } from '@/lib/projects';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref, locales } from '@/lib/i18n';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getProjectReReadings().map((reReading) => ({
      lang,
      slug: reReading.slug,
    })),
  );
}

function CropMarks() {
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
          className={`pointer-events-none absolute h-2.5 w-2.5 text-[#7f242a] ${position}`}
        >
          <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
        </svg>
      ))}
    </>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const reReading = getProjectReReading(slug);

  if (!reReading) {
    notFound();
  }

  const rawProject = getProjectBySlug(reReading.slug);
  const project = rawProject ? localizeProject(rawProject, lang) : undefined;
  const paragraphs = getReReadingParagraphs(reReading);

  return (
    <MainLayout variant='reading'>
      <article className='relative mx-auto mt-8 flex w-full max-w-4xl flex-col gap-6 bg-[#f8f8f6] px-5 py-8 sm:mt-12 sm:px-10 sm:py-12 lg:px-16'>
        <CropMarks />

        <header className='relative overflow-hidden border-s-4 border-[#7f242a] bg-[#d67878]/10 p-5 sm:p-7'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply'
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
              backgroundSize: '4px 4px',
            }}
          />
          <div className='relative flex flex-col gap-3'>
            <p className='text-[0.7rem] font-extrabold tracking-wide text-[#7f242a] uppercase sm:text-xs'>
              {dict.common.reReading}
            </p>
            <h1 className='text-3xl font-semibold leading-tight text-black sm:text-4xl'>
              {reReading.title}
            </h1>
            <div className='flex flex-col gap-1 text-sm leading-6 text-[#4f4a43] sm:text-base'>
              <p>{reReading.credit ?? reReading.author}</p>
              {reReading.role && <p>{reReading.role}</p>}
              {reReading.source && <p>{reReading.source}</p>}
              {reReading.year && <p>{reReading.year}</p>}
              {project && (
                <Link
                  href={localizeHref(lang, `/repository/${project.slug}`)}
                  className='w-fit text-[#7f242a] underline decoration-[#7f242a]/40 underline-offset-4 transition-colors hover:text-black'
                >
                  {project['1. Basic Information']['Project Title']}
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className='flex flex-col gap-4'>
          {paragraphs.map((paragraph, index) => {
            const isBoldParagraph =
              reReading.boldParagraphs?.includes(paragraph) ?? false;

            return (
              <p
                key={`reading-paragraph-${index}`}
                className={`whitespace-pre-line text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7 ${
                  isBoldParagraph ? 'font-semibold' : ''
                }`}
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>
    </MainLayout>
  );
}
