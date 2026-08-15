import MainLayout from '@/components/MainLayout';
import ProjectSectionNav from '@/components/ProjectSectionNav';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

type AboutBlock = {
  type: string;
  text?: string;
  items?: { label: string; text: string; href?: string }[];
};

type AboutSection = {
  id: string;
  title: string;
  blocks?: AboutBlock[];
  team?: { name: string; role: string; url?: string }[];
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

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className='text-lg font-semibold leading-7 tracking-normal text-black sm:text-xl'>
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

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const about = dict.about;
  const sections = about.sections as AboutSection[];
  const linkClassName =
    'font-medium underline decoration-[#7f242a]/45 underline-offset-4 transition-colors hover:text-[#7f242a]';

  function renderBlocks(blocks: AboutBlock[] | undefined, keyPrefix: string) {
    return blocks?.map((block, index) => {
      const key = `${keyPrefix}-${index}`;

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
                {item.href && (
                  <>
                    {' '}
                    <Link
                      href={localizeHref(locale, item.href)}
                      className={`inline-flex items-center gap-1 ${linkClassName}`}
                    >
                      {about.openFormCta}
                      <span aria-hidden='true'>
                        {lang === 'fa' ? '←' : '→'}
                      </span>
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        );
      }

      return <Paragraph key={key}>{block.text}</Paragraph>;
    });
  }

  const navSections = [
    {
      id: 'overview',
      label: about.overviewLabel,
      content: (
        <section
          key='overview'
          id='overview'
          className='flex scroll-mt-28 flex-col gap-3'
        >
          {about.intro.map((paragraph, index) => (
            <Paragraph key={`intro-${index}`}>{paragraph}</Paragraph>
          ))}
        </section>
      ),
    },
    ...sections.map((section) => ({
      id: section.id,
      label: section.title,
      content: (
        <section
          key={section.id}
          id={section.id}
          className='flex scroll-mt-28 flex-col gap-3'
        >
          <h2 className='text-xl font-semibold leading-tight tracking-normal text-black sm:text-2xl'>
            {section.title}
          </h2>
          {section.team ? (
            <div className='mt-2 flex flex-col gap-4'>
              {section.team.map((member) => (
                <div key={member.name}>
                  {member.url ? (
                    <a
                      href={member.url}
                      target='_blank'
                      rel='noreferrer'
                      className={`text-base font-semibold sm:text-lg ${linkClassName}`}
                    >
                      {member.name}
                    </a>
                  ) : (
                    <p className='text-base font-semibold text-black sm:text-lg'>
                      {member.name}
                    </p>
                  )}
                  <p className='text-sm text-[#777066] sm:text-base'>
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            renderBlocks(section.blocks, section.id)
          )}
          {section.id === 'contact' && (
            <Paragraph>
              {about.emailLabel}{' '}
              <a
                className={linkClassName}
                href='mailto:bast.work.team@gmail.com'
              >
                {about.emailCta}
              </a>
            </Paragraph>
          )}
        </section>
      ),
    })),
  ];

  return (
    <MainLayout>
      <div className='mt-6 flex flex-col gap-10 pb-32 sm:mt-8 sm:pb-40 lg:flex-row lg:items-start lg:gap-24'>
        <ProjectSectionNav
          sections={navSections.map(({ id, label }) => ({ id, label }))}
          ariaLabel={about.sectionsNavLabel}
        />
        <article className='flex min-w-0 flex-1 flex-col gap-10'>
          {navSections.map((section) => section.content)}
        </article>
      </div>
    </MainLayout>
  );
}
