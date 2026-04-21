import MainLayout from '@/components/MainLayout';
import { getProjectReReadings } from '@/data/rereading';
import Link from 'next/link';

export default function Page() {
  const reReadings = getProjectReReadings();
  const introParagraphs = [
    'A re-reading(خوانش Khanesh) is a text commissioned specifically for Bast in response to a project included in the repository. Written by artists, researchers, or cultural practitioners, these texts engage with a project from another perspective and aim to expand its context, questions, and conditions.',
    'A re-reading is not simply a description of the project. It may take different forms: a critical interpretation, a personal reflection, an experiential narrative, or a creative response that continues the trajectory of the work. In this sense, each reading seeks to extend the context of a project and open new layers of meaning and dialogue around it.',
    'Not all projects in the Bast repository include a re-reading. These texts are written gradually over time and added to selected projects—sometimes suggested by the artist of the project, sometimes invited by the Bast team, and sometimes initiated by individuals who express interest in engaging with a project.',
    'This page gathers the re-readings written for the Bast project.',
  ];

  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-4 sm:mt-8'>
        {/* <h1 className='text-3xl font-semibold leading-tight tracking-normal text-black sm:text-4xl'>
          - Re-readings
        </h1> */}

        {introParagraphs.map((paragraph, index) => (
          <p
            key={`re-reading-intro-${index}`}
            className='text-base leading-7 sm:text-[1.2rem] sm:leading-8'
          >
            {paragraph}
          </p>
        ))}
      </article>

      <div className='mx-auto mt-16 grid w-full max-w-5xl gap-x-10 gap-y-9 pb-24 md:grid-cols-2'>
        {reReadings.map((reReading) => (
          <Link
            key={reReading.slug}
            href={`/readings/${reReading.slug}`}
            className='flex flex-col gap-2 border-t border-[#d9d2c7] pt-4 text-black transition-colors hover:text-[#A24E4F]'
          >
            <h2 className='text-xl font-semibold leading-7'>
              {reReading.title}
            </h2>
            <p className='text-base leading-6 text-[#777066]'>
              {reReading.author}
            </p>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
}
