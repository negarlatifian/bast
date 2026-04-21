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
      <section className='relative min-h-[calc(100dvh-7rem)] overflow-hidden py-8 lg:py-10'>
        <div className='pointer-events-none relative z-10 flex max-w-[48rem] items-start p-5 sm:p-7 lg:p-8'>
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
