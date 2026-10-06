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
        <h1 className='mt-6 pb-24 text-xl leading-tight font-semibold text-black sm:mt-8 sm:text-3xl lg:text-[clamp(1.6rem,2.4vw,2.6rem)]'>
          {dict.library.comingSoon}
        </h1>
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
