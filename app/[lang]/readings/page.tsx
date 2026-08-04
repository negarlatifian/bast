import MainLayout from '@/components/MainLayout';
import { getProjectReReadings } from '@/data/rereading';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref } from '@/lib/i18n';
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
  const reReadings = getProjectReReadings();

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
      </article>

      <div className='mx-auto mt-16 grid w-full max-w-5xl gap-x-10 gap-y-9 pb-24 md:grid-cols-2'>
        {reReadings.map((reReading) => (
          <Link
            key={reReading.slug}
            href={localizeHref(lang, `/readings/${reReading.slug}`)}
            className='flex flex-col gap-2 border-t border-[#d9d2c7] pt-4 text-black transition-colors hover:text-[#7f242a]'
          >
            <h2 className='text-xl font-semibold leading-7'>
              {reReading.title}
            </h2>
            <p className='text-sm leading-6 text-[#777066]'>
              {reReading.author}
            </p>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
}
