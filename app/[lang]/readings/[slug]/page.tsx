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
    'top-2 left-2 sm:top-3 sm:left-3',
    'top-2 right-2 rotate-90 sm:top-3 sm:right-3',
    'bottom-2 left-2 -rotate-90 sm:bottom-3 sm:left-3',
    'bottom-2 right-2 rotate-180 sm:bottom-3 sm:right-3',
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
  const reReading = getProjectReReading(slug, lang);

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

        <header className='flex items-stretch border border-dashed border-[#7f242a]'>
          <p className='flex shrink-0 items-center justify-center border-l border-dashed border-[#7f242a] px-2.5 py-4 text-[0.65rem] font-bold tracking-[0.2em] text-[#7f242a] uppercase [writing-mode:vertical-rl] ltr:rotate-180 sm:px-3 sm:text-xs'>
            {dict.common.reReading}
          </p>
          <div className='flex flex-col gap-3 px-5 py-5 sm:px-7 sm:py-6'>
            <h1 className='text-2xl font-semibold leading-tight text-black sm:text-3xl'>
              {reReading.title}
            </h1>
            {project && (
              <Link
                href={localizeHref(lang, `/repository/${project.slug}`)}
                className='self-start text-base text-[#7f242a] underline decoration-[#7f242a]/40 underline-offset-4 transition-colors hover:text-black sm:text-lg'
              >
                {project['1. Basic Information']['Project Title']}
              </Link>
            )}
            <p className='flex flex-wrap items-baseline gap-x-2 text-sm leading-6 text-[#4f4a43] sm:text-base'>
              {[
                reReading.credit ?? reReading.author,
                reReading.role,
                reReading.source,
                reReading.year,
              ]
                .filter(Boolean)
                .map((item, index) => (
                  <span key={`reading-meta-${index}`} className='flex items-baseline gap-x-2'>
                    {index > 0 && (
                      <span aria-hidden='true' className='text-[#7f242a]'>
                        ·
                      </span>
                    )}
                    {item}
                  </span>
                ))}
            </p>
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
