import MainLayout from '@/components/MainLayout';
import {
  getProjectReReading,
  getProjectReReadings,
  getReReadingParagraphs,
} from '@/data/rereading';
import { getProjectBySlug } from '@/lib/projects';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getProjectReReadings().map((reReading) => ({
    slug: reReading.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reReading = getProjectReReading(slug);

  if (!reReading) {
    notFound();
  }

  const project = getProjectBySlug(reReading.slug);
  const paragraphs = getReReadingParagraphs(reReading);

  return (
    <MainLayout variant='reading'>
      <article className='mx-auto mt-8 flex w-full max-w-4xl flex-col gap-8 bg-[#f8f8f6] px-5 py-8 sm:mt-12 sm:px-10 sm:py-12 lg:px-16'>
        <header className='flex flex-col gap-4'>
          <p className='text-base leading-6 text-[#777066]'>Re-reading</p>
          <h1 className='text-3xl font-semibold leading-tight text-black sm:text-4xl'>
            {reReading.title}
          </h1>
          <div className='flex flex-col gap-1 text-base leading-6 text-[#4f4a43] sm:text-lg'>
            <p>{reReading.credit ?? reReading.author}</p>
            {reReading.role && <p>{reReading.role}</p>}
            {reReading.source && <p>{reReading.source}</p>}
            {reReading.year && <p>{reReading.year}</p>}
            {project && (
              <Link
                href={`/repository/${project.slug}`}
                className='w-fit text-[#7f242a] underline decoration-[#7f242a]/40 underline-offset-4 transition-colors hover:text-black'
              >
                {project['1. Basic Information']['Project Title']}
              </Link>
            )}
          </div>
        </header>

        <div className='flex flex-col gap-5'>
          {paragraphs.map((paragraph, index) => {
            const isBoldParagraph =
              reReading.boldParagraphs?.includes(paragraph) ?? false;

            return (
              <p
                key={`reading-paragraph-${index}`}
                className={`whitespace-pre-line text-base leading-7 text-[#24211d] sm:text-[1.08rem] sm:leading-8 ${
                  isBoldParagraph ? 'font-semibold' : ''
                }`}
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>
    </MainLayout>
  );
}
