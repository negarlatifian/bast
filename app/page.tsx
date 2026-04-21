import HomeRepositoryPreview from '@/components/HomeRepositoryPreview';
import MainLayout from '@/components/MainLayout';
import { getProjectImage, projects } from '@/lib/projects';

export default function Page() {
  const previewProjects = projects.map((project) => {
    const title = project['1. Basic Information']['Project Title'];

    return {
      slug: project.slug,
      imageAlt: project['1. Basic Information']['Featured Project Image'].alt || title,
      imageSrc: getProjectImage(project),
    };
  });

  return (
    <MainLayout>
      <section className='grid min-h-[calc(100dvh-7rem)] gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10 lg:py-10'>
        <div className='flex items-start border border-black/10 p-5 sm:p-7 lg:p-8'>
          <h1 className='max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-black sm:text-5xl sm:leading-tight lg:text-6xl'>
            Bast is a curatorial platform dedicated to the study, rethinking,
            and documentation of participatory art in Iran.
          </h1>
        </div>

        <HomeRepositoryPreview projects={previewProjects} />
      </section>
    </MainLayout>
  );
}
