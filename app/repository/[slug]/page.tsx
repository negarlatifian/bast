import MainLayout from '@/components/MainLayout';
import ProjectMediaStrip from '@/components/ProjectMediaStrip';
import { getProjectReReading } from '@/data/rereading';
import { getProjectBySlug, getProjectMedia, projects } from '@/lib/projects';
import Link from 'next/link';
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
  const mediaItems = getProjectMedia(project);
  const reReading = getProjectReReading(project.slug);
  const introductionSection = project.sections.find(
    (section) => section.id === '2'
  );
  const openingSections = project.sections.filter(
    (section) => section.id === '3'
  );
  const remainingSections = project.sections.filter(
    (section) =>
      !['2', '3'].includes(section.id) &&
      section.title.toLowerCase() !== 're-readings'
  );

  return (
    <MainLayout>
      <article className='mt-6 pb-16 sm:mt-8'>
        <header className='mb-10 flex flex-col gap-3'>
          <h1 className='text-3xl font-semibold leading-tight text-black sm:text-4xl'>
            {title}
          </h1>
          {artists.length > 0 && (
            <p className='text-sm leading-6 text-[#4f4a43] sm:text-base'>
              {artists.join(', ')}
            </p>
          )}
          {(location || year) && (
            <p className='text-sm leading-6 text-[#777066]'>
              {[location, year].filter(Boolean).join(' / ')}
            </p>
          )}
        </header>

        <div className='flex flex-col gap-10'>
          {introductionSection && (
            <section className='flex flex-col gap-3'>
              <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                {introductionSection.title}
              </h2>
              {introductionSection.paragraphs.map((paragraph, index) => (
                <p
                  key={`${introductionSection.id}-${index}`}
                  className='text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7'
                >
                  {paragraph}
                </p>
              ))}
            </section>
          )}

          {mediaItems.length > 0 && (
            <ProjectMediaStrip mediaItems={mediaItems} title={title} />
          )}

          {openingSections.map((section) => (
            <section key={section.id} className='flex flex-col gap-3'>
              <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.id}-${index}`}
                  className='text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7'
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {project['Participation & Process']?.subsections?.map(
            (subsection, index) => (
              <section
                key={`${subsection.title}-${index}`}
                className='flex flex-col gap-3'
              >
                <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                  4. Participation & Process
                </h2>
                {subsection.title && (
                  <h3 className='text-base font-medium leading-6 text-[#4f4a43] sm:text-lg'>
                    {subsection.title}
                  </h3>
                )}
                {subsection.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={`${subsection.title}-${index}-${paragraphIndex}`}
                    className='text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7'
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            )
          )}

          {reReading && (
            <section id='re-reading' className='flex flex-col gap-3'>
              <div className='flex flex-col gap-2'>
                <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                  Re-reading
                </h2>
                <h3 className='text-base font-medium leading-6 text-[#4f4a43] sm:text-lg'>
                  {reReading.title}
                </h3>
                <p className='text-sm leading-6 text-[#777066]'>
                  {reReading.author}
                </p>
              </div>
              <Link
                href={`/readings/${project.slug}`}
                className='w-fit text-base font-medium leading-6 text-[#7f242a] underline decoration-[#7f242a]/40 underline-offset-4 transition-colors hover:text-black'
              >
                Read the re-reading
              </Link>
            </section>
          )}

          {remainingSections.map((section) => (
            <section key={section.id} className='flex flex-col gap-3'>
              <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph, index) => (
                <p
                  key={`${section.id}-${index}`}
                  className='text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7'
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </MainLayout>
  );
}
