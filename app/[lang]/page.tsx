import { notFound } from 'next/navigation';

import HomeRepositoryPreview from '@/components/HomeRepositoryPreview';
import MainLayout from '@/components/MainLayout';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale } from '@/lib/i18n';
import { getProjectImage, localizeProject, projects } from '@/lib/projects';

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
  const previewProjects = projects.map((rawProject) => {
    const project = localizeProject(rawProject, lang);
    const title = project['1. Basic Information']['Project Title'];

    return {
      slug: project.slug,
      imageAlt:
        project['1. Basic Information']['Featured Project Image'].alt || title,
      imageSrc: getProjectImage(project),
    };
  });

  return (
    <MainLayout>
      <section className='relative box-border min-h-[calc(100dvh-7rem)] overflow-hidden py-8 lg:py-10'>
        <div className='pointer-events-none relative z-10 flex max-w-[48rem] items-start p-5 sm:p-7 lg:max-w-[45vw] lg:p-8'>
          <h1 className='max-w-3xl text-[1.7rem] font-semibold leading-tight tracking-normal text-black sm:text-4xl sm:leading-tight md:text-[2.75rem] lg:text-[clamp(2.7rem,min(3.8vw,6.2vh),3.8rem)]'>
            {dict.home.heroTitle}
          </h1>
        </div>

        <HomeRepositoryPreview projects={previewProjects} />
      </section>
    </MainLayout>
  );
}
