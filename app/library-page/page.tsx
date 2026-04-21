import MainLayout from '@/components/MainLayout';

export default function Page() {
  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-3 sm:mt-8'>
        <p className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'>
          The Bast Library is a growing collection of resources related to
          participatory art. This section includes books, articles, interviews,
          research texts, and theoretical materials that contribute to the study
          and understanding of participatory artistic practices.
        </p>
        <p className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'>
          The aim of the library is to provide access to texts and research that
          help frame the theoretical, historical, and critical contexts of
          participatory art. These resources are not limited to Iran and may
          include materials from different geographical and research contexts.
        </p>
        <p className='text-sm leading-6 sm:text-[1.08rem] sm:leading-7'>
          The Bast Library will continue to expand over time as new resources
          are added to the platform.
        </p>
      </article>
    </MainLayout>
  );
}
