import MainLayout from '@/components/MainLayout';
import { getProjectBySlug, getProjectImage, projects } from '@/lib/projects';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const basicInformation = project['1. Basic Information'];
  const title = basicInformation['Project Title'];
  const artists =
    basicInformation[
      'Artist / Group / Collective / Organizer / Supervisor / Initiator'
    ];
  const location = basicInformation.Location.text;
  const year = basicInformation['Year / Time Period'].text;
  const imageAlt = basicInformation['Featured Project Image'].alt || title;
  const documentationItems =
    project['7. Project Documentation and Images']?.items?.filter(
      (item) => item.type === 'photo' && item.src.trim().startsWith('/')
    ) ?? [];
  const openingSections = project.sections.filter((section) =>
    ['2', '3'].includes(section.id)
  );
  const remainingSections = project.sections.filter(
    (section) => !['2', '3'].includes(section.id)
  );

  return (
    <MainLayout>
      <article className='mt-6 pb-16 sm:mt-8'>
        <div className='relative mb-8 aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10]'>
          <Image
            src={getProjectImage(project)}
            alt={imageAlt}
            fill
            priority
            sizes='(min-width: 1024px) 1024px, 100vw'
            className='object-cover'
          />
        </div>

        <header className='mb-10 flex flex-col gap-3'>
          <h1 className='text-3xl font-semibold leading-tight text-black sm:text-4xl'>
            {title}
          </h1>
          {artists.length > 0 && (
            <p className='text-base leading-7 text-[#4f4a43] sm:text-lg'>
              {artists.join(', ')}
            </p>
          )}
          {(location || year) && (
            <p className='text-base leading-6 text-[#777066]'>
              {[location, year].filter(Boolean).join(' / ')}
            </p>
          )}
        </header>

        <div className='flex flex-col gap-10'>
          {openingSections.map((section) => (
            <section key={section.id} className='flex flex-col gap-4'>
              <h2 className='text-xl font-semibold leading-7 text-black sm:text-2xl sm:leading-8'>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className='text-base leading-7 text-[#24211d] sm:text-[1.08rem] sm:leading-8'
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {project['4. Participation & Process']?.subsections?.map(
            (subsection, index) => (
              <section
                key={`${subsection.title}-${index}`}
                className='flex flex-col gap-4'
              >
                <h2 className='text-xl font-semibold leading-7 text-black sm:text-2xl sm:leading-8'>
                  4. Participation & Process
                </h2>
                {subsection.title && (
                  <h3 className='text-lg font-medium leading-7 text-[#4f4a43] sm:text-xl'>
                    {subsection.title}
                  </h3>
                )}
                {subsection.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className='text-base leading-7 text-[#24211d] sm:text-[1.08rem] sm:leading-8'
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            )
          )}

          {remainingSections.map((section) => (
            <section key={section.id} className='flex flex-col gap-4'>
              <h2 className='text-xl font-semibold leading-7 text-black sm:text-2xl sm:leading-8'>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className='text-base leading-7 text-[#24211d] sm:text-[1.08rem] sm:leading-8'
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {documentationItems.length > 0 && (
            <section className='flex flex-col gap-5'>
              <h2 className='text-xl font-semibold leading-7 text-black sm:text-2xl sm:leading-8'>
                7. Project Documentation and Images
              </h2>
              <div className='columns-1 gap-5 sm:columns-2'>
                {documentationItems.map((item) => (
                  <figure
                    key={item.src}
                    className='mb-5 break-inside-avoid overflow-hidden bg-white/30'
                  >
                    <div className='relative aspect-[5/4] w-full'>
                      <Image
                        src={item.src.trim()}
                        alt={item.description || title}
                        fill
                        sizes='(min-width: 1024px) 500px, 100vw'
                        className='object-cover'
                      />
                    </div>
                    {item.description && (
                      <figcaption className='px-3 py-2 text-sm leading-5 text-[#777066]'>
                        {item.description}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </MainLayout>
  );
}
