import LibraryView from '@/components/LibraryView';
import MainLayout from '@/components/MainLayout';
import { getLibraryEntriesByLanguage } from '@/data/library';
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
  const entriesByLanguage = {
    en: getLibraryEntriesByLanguage('en'),
    fa: getLibraryEntriesByLanguage('fa'),
  };

  return (
    <MainLayout>
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

      <LibraryView entriesByLanguage={entriesByLanguage} />
    </MainLayout>
  );
}
