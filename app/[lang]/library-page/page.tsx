import MainLayout from '@/components/MainLayout';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale } from '@/lib/i18n';
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
      </article>
    </MainLayout>
  );
}
