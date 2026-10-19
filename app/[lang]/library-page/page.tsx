import LibraryView from '@/components/LibraryView';
import MainLayout from '@/components/MainLayout';
import { getLibraryEntriesByLanguage } from '@/data/library';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref } from '@/lib/i18n';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Temporarily show a "coming soon" placeholder. Set to false to restore the
// full library view below.
const LIBRARY_COMING_SOON = true;

// Spine sizes and fills match LibraryView's shelves.
const emptyShelf = [
  'h-44 w-10 bg-[#efe9dc] sm:h-48 sm:w-11',
  'h-52 w-8 bg-[#d9d2c7] sm:h-56 sm:w-9',
  'h-36 w-12 bg-[#e9e3d6] sm:h-40 sm:w-14',
  'h-44 w-8 bg-[#e9e3d6] sm:h-48 sm:w-9',
  'h-52 w-10 bg-[#efe9dc] sm:h-56 sm:w-11',
  'h-36 w-8 bg-[#d9d2c7] sm:h-40 sm:w-9',
  'h-44 w-12 bg-[#efe9dc] sm:h-48 sm:w-14',
];

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

  const intro = (
    <article className='mt-6 flex flex-col gap-3 sm:mt-8'>
      {dict.library.intro.map((paragraph, index) => (
        <p
          key={`library-intro-${index}`}
          className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'
        >
          {paragraph}
        </p>
      ))}
      <Link
        href={localizeHref(lang, '/suggest-a-resource')}
        className='mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium leading-6 text-[#7f242a] transition-colors hover:text-black sm:text-[1.08rem] sm:leading-7'
      >
        {dict.library.suggestResource}
        <span aria-hidden='true'>{lang === 'fa' ? '←' : '→'}</span>
      </Link>
    </article>
  );

  if (LIBRARY_COMING_SOON) {
    return (
      <MainLayout>
        <section className='mt-10 pb-24 sm:mt-12'>
          <div className='mb-5 flex items-center gap-3'>
            <svg
              aria-hidden='true'
              viewBox='0 0 10 10'
              className='h-3 w-3 shrink-0 text-[#7f242a]'
            >
              <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
            </svg>
            <h1 className='shrink-0 text-lg font-semibold tracking-wide text-[#7f242a] uppercase sm:text-xl'>
              {dict.library.comingSoon}
            </h1>
            <span className='h-px flex-1 bg-[#d9d2c7]' />
          </div>

          {/* An empty shelf, drawn with the same blank spines the library
              uses, waiting to be filled. */}
          <div aria-hidden='true' className='overflow-hidden'>
            <div className='flex items-end gap-1.5 px-1'>
              {emptyShelf.map((spine, index) => (
                <span
                  key={index}
                  className={`shrink-0 border border-[#d9d2c7] ${spine}`}
                />
              ))}
            </div>
            <div className='border-t border-[#d9d2c7]' />
          </div>
        </section>
      </MainLayout>
    );
  }

  const entriesByLanguage = {
    en: getLibraryEntriesByLanguage('en'),
    fa: getLibraryEntriesByLanguage('fa'),
  };

  return (
    <MainLayout>
      {intro}

      <LibraryView entriesByLanguage={entriesByLanguage} />
    </MainLayout>
  );
}
