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
      <section className='mt-6 sm:mt-8'>
        <p className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'>
          {dict.common.comingSoon}
        </p>
      </section>
    </MainLayout>
  );
}
