'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useLocale } from './LocaleProvider';
import { localizeHref } from '@/lib/i18n';

export type ProjectListRowSummary = {
  slug: string;
  title: string;
  artists: string[];
  imageSrc: string;
  imageAlt: string;
};

type ProjectListRowProps = {
  project: ProjectListRowSummary;
  /** Optional secondary line under the artists, e.g. a year or a city. */
  meta?: string;
};

export default function ProjectListRow({ project, meta }: ProjectListRowProps) {
  const { lang } = useLocale();

  return (
    <Link
      href={localizeHref(lang, `/repository/${project.slug}`)}
      className='group flex items-center gap-3 border-t border-[#d9d2c7] py-3 first:border-t-0'
    >
      <span className='relative h-14 w-14 shrink-0 overflow-hidden bg-[#e9e3d6]'>
        <Image
          src={project.imageSrc}
          alt={project.imageAlt}
          fill
          sizes='56px'
          className='object-cover transition duration-500 group-hover:scale-105'
        />
      </span>
      <span className='flex min-w-0 flex-col gap-0.5'>
        <span className='truncate text-sm font-semibold leading-5 text-[rgb(54,54,54)] transition-colors group-hover:text-[#7f242a]'>
          {project.title}
        </span>
        {project.artists.length > 0 && (
          <span className='truncate text-xs leading-4 text-[#777066]'>
            {project.artists.join(', ')}
          </span>
        )}
        {meta && (
          <span className='truncate text-xs leading-4 text-[#a39a8d]'>
            {meta}
          </span>
        )}
      </span>
    </Link>
  );
}
