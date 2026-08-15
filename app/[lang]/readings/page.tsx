import MainLayout from '@/components/MainLayout';
import { getProjectReReadings } from '@/data/rereading';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref } from '@/lib/i18n';
import { getProjectBySlug, localizeProject } from '@/lib/projects';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const reReadings = getProjectReReadings().map((reReading) => {
    const rawProject = getProjectBySlug(reReading.slug);
    const project = rawProject ? localizeProject(rawProject, lang) : undefined;

    return {
      reReading,
      projectTitle: project?.['1. Basic Information']['Project Title'],
    };
  });

  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-3 sm:mt-8'>
        {dict.readings.intro.map((paragraph, index) => (
          <p
            key={`re-reading-intro-${index}`}
            className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'
          >
            {paragraph}
          </p>
        ))}
        <Link
          href={localizeHref(lang, '/propose-a-re-reading')}
          className='mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium leading-6 text-[#7f242a] transition-colors hover:text-black sm:text-[1.08rem] sm:leading-7'
        >
          {dict.readings.proposeReading}
          <span aria-hidden='true'>{lang === 'fa' ? '←' : '→'}</span>
        </Link>
      </article>

      <div className='mt-12 grid w-full gap-x-8 gap-y-8 pb-24 sm:mt-14 md:grid-cols-2'>
        {reReadings.map(({ reReading, projectTitle }) => (
          <Link
            key={reReading.slug}
            href={localizeHref(lang, `/readings/${reReading.slug}`)}
            className='group relative overflow-hidden border-s-4 border-[#7f242a] bg-[#d67878]/10 p-5 transition-colors hover:bg-[#d67878]/15 sm:p-7'
          >
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply'
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
                backgroundSize: '4px 4px',
              }}
            />
            <div className='relative flex flex-col gap-2'>
              <p className='text-[0.7rem] font-extrabold tracking-wide text-[#7f242a] uppercase sm:text-xs'>
                {dict.common.reReading}
              </p>
              <h2 className='text-lg font-semibold leading-7 text-black transition-colors group-hover:text-[#7f242a] sm:text-xl'>
                {reReading.title}
              </h2>
              <p className='text-sm leading-6 text-[#777066] sm:text-base'>
                {reReading.author}
              </p>
              {projectTitle && (
                <p className='text-sm leading-6 text-[#a39a8d]'>
                  {dict.readings.aboutProjectLabel} {projectTitle}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
}
