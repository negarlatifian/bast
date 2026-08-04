import MainLayout from '@/components/MainLayout';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

type AboutBlock = {
  type: string;
  text?: string;
  items?: { label: string; text: string }[];
};

function Paragraph({
  children,
  bold = false,
}: {
  children: ReactNode;
  bold?: boolean;
}) {
  return (
    <p
      className={`text-sm leading-6 tracking-normal text-black sm:text-[1.08rem] sm:leading-7 ${
        bold ? 'font-semibold' : ''
      }`}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className='mt-6 text-xl font-semibold leading-tight tracking-normal text-black sm:mt-8 sm:text-2xl'>
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className='mt-4 text-lg font-semibold leading-7 tracking-normal text-black sm:mt-5 sm:text-xl'>
      {children}
    </h3>
  );
}

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
  const about = dict.about;

  return (
    <MainLayout>
      <article className='mt-6 flex flex-col gap-3 pb-32 sm:mt-8 sm:pb-40'>
        {(about.blocks as AboutBlock[]).map((block, index) => {
          const key = `about-block-${index}`;

          if (block.type === 'h2') {
            return <SectionTitle key={key}>{block.text}</SectionTitle>;
          }

          if (block.type === 'h3') {
            return <SubTitle key={key}>{block.text}</SubTitle>;
          }

          if (block.type === 'lead') {
            return (
              <Paragraph key={key} bold>
                {block.text}
              </Paragraph>
            );
          }

          if (block.type === 'ul') {
            return (
              <ul
                key={key}
                className='ms-6 list-disc space-y-3 text-sm leading-6 tracking-normal text-black sm:ms-12 sm:text-[1.08rem] sm:leading-7'
              >
                {block.items?.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>
                    <strong>{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
            );
          }

          return <Paragraph key={key}>{block.text}</Paragraph>;
        })}

        <Paragraph>
          {about.emailLabel}{' '}
          <a
            className='font-medium underline decoration-[#7f242a]/45 underline-offset-4 transition-colors hover:text-[#7f242a]'
            href='mailto:bast.work.team@gmail.com'
          >
            {about.emailCta}
          </a>
        </Paragraph>

        <div className='mt-8 flex flex-col gap-2 text-sm leading-6 tracking-normal text-black sm:mt-10 sm:text-[1.08rem] sm:leading-7'>
          <p>
            <span className='font-semibold'>{about.coInitiatedBy} </span>
            <a
              className='font-medium underline decoration-[#7f242a]/45 underline-offset-4 transition-colors hover:text-[#7f242a]'
              href='https://www.reyhanehmirjahani.com/'
              rel='noreferrer'
              target='_blank'
            >
              Reyhaneh Mirjahani
            </a>{' '}
            <span className='text-black/60'>{about.andWord}</span>{' '}
            <a
              className='font-medium underline decoration-[#7f242a]/45 underline-offset-4 transition-colors hover:text-[#7f242a]'
              href='https://amiralighasemi.org/'
              rel='noreferrer'
              target='_blank'
            >
              Amirali Ghasemi
            </a>
          </p>
          <p>
            <span className='font-semibold'>{about.platformBy} </span>
            <a
              className='font-medium underline decoration-[#7f242a]/45 underline-offset-4 transition-colors hover:text-[#7f242a]'
              href='https://www.negarlatifian.com/'
              rel='noreferrer'
              target='_blank'
            >
              Negar Latifian
            </a>
          </p>
        </div>
      </article>
    </MainLayout>
  );
}
