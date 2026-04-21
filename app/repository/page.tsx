import MainLayout from '@/components/MainLayout';
import { getProjectImage, projects } from '@/lib/projects';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-4 sm:mt-8'>
        <p className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'>
          Bast Repository is a growing collection of participatory art projects
          that have taken place in Iran. Each project/work is presented through
          multiple layers of documentation, including basic information,
          archival materials, and conversations with the artists. In some cases,
          projects are further expanded through a commissioned reading written
          by another practitioner, researcher, or cultural worker. These
          additional perspectives open space for interpretation, critique, and
          reflection, allowing the projects to be revisited from different
          positions.
        </p>
        <p className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'>
          The repository does not aim to establish a definitive history of
          participatory art in Iran. Instead, it brings together diverse
          examples that reflect the variety of ways participation has been
          practiced across artistic, social, and spatial contexts. Many of the
          projects included respond to specific constraints, conditions, and
          urgencies, and reveal different approaches to collaboration,
          engagement, and collective action.
        </p>
        <p className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'>
          As the platform develops, new projects, materials, and readings may be
          added, allowing the repository to grow over time and remain open to
          further contributions and interpretations. You are invited to suggest
          a participatory art project here.
        </p>
      </article>

      <section className='mt-10 columns-1 gap-5 pb-16 sm:mt-12 sm:columns-2 lg:columns-3'>
        {projects.map((project, index) => {
          const basicInformation = project['1. Basic Information'];
          const title = basicInformation['Project Title'];
          const artists =
            basicInformation[
              'Artist / Group / Collective / Organizer / Supervisor / Initiator'
            ];
          const imageAlt =
            basicInformation['Featured Project Image'].alt || title;
          const aspectClass =
            index % 5 === 0
              ? 'aspect-[4/5]'
              : index % 3 === 0
                ? 'aspect-[1/1]'
                : 'aspect-[5/4]';

          return (
            <Link
              key={project.slug}
              href={`/repository/${project.slug}`}
              className='group mb-5 block break-inside-avoid overflow-hidden'
            >
              <div className={`relative w-full ${aspectClass}`}>
                <Image
                  src={getProjectImage(project)}
                  alt={imageAlt}
                  fill
                  sizes='(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw'
                  className='object-cover transition duration-500 group-hover:scale-[1.03]'
                />
                <div className='absolute inset-0 bg-[#d67878]/20 transition-colors duration-500 group-hover:bg-[#d67878]/72' />
                <div className='absolute inset-0 flex flex-col justify-end gap-1 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
                  <h2 className='text-[1.15rem] font-semibold leading-6 text-white'>
                    {title}
                  </h2>
                  {artists.length > 0 && (
                    <p className='text-[0.92rem] leading-5 text-white/90'>
                      {artists.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </MainLayout>
  );
}
