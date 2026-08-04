import MainLayout from '@/components/MainLayout';
import ProjectMediaStrip from '@/components/ProjectMediaStrip';
import ProjectSectionNav from '@/components/ProjectSectionNav';
import { getProjectReReading } from '@/data/rereading';
import {
  getProjectBySlug,
  getProjectImage,
  getProjectMedia,
  localizeProject,
  projects,
} from '@/lib/projects';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, localizeHref, locales } from '@/lib/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment, type ReactNode } from 'react';

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    projects.map((project) => ({
      lang,
      slug: project.slug,
    })),
  );
}

const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
const autoLinkPattern = /(https?:\/\/[^\s,]+|www\.[^\s,]+)/g;
const boldPattern = /\*\*([^*]+)\*\*/g;
const emphasisPattern = /\*([^*]+)\*/g;

const inlineLinkClassName =
  'text-[#7f242a] underline decoration-[#7f242a]/40 underline-offset-4 transition-colors hover:text-black';

function normalizeProjectParagraph(paragraph: string) {
  return paragraph.replace(/^bio:\s*/i, '');
}

function getLinkHref(url: string) {
  return url.startsWith('www.') ? `https://${url}` : url;
}

/** Applies a transform to every plain-string node, leaving elements as-is. */
function transformTextNodes(
  nodes: ReactNode[],
  transform: (text: string, keyPrefix: string) => ReactNode[],
): ReactNode[] {
  return nodes.flatMap((node, index) =>
    typeof node === 'string' ? transform(node, `n${index}`) : [node],
  );
}

/** Renders `[label](url)` markers as styled links. */
function renderWithMarkdownLinks(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(markdownLinkPattern)) {
    const [fullMatch, label, url] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <a
        key={`${keyPrefix}-mdlink-${index}`}
        href={getLinkHref(url)}
        target='_blank'
        rel='noreferrer'
        className={inlineLinkClassName}
      >
        {label}
      </a>,
    );
    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/** Auto-links bare URLs left in plain text. */
function renderWithAutoLinks(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(autoLinkPattern)) {
    const url = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <a
        key={`${keyPrefix}-autolink-${index}`}
        href={getLinkHref(url)}
        target='_blank'
        rel='noreferrer'
        className={inlineLinkClassName}
      >
        {url}
      </a>,
    );
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/** Renders `**word**` markers as <strong>. Must run before renderWithEmphasis. */
function renderWithBold(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(boldPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(<strong key={`${keyPrefix}-strong-${index}`}>{match[1]}</strong>);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/** Renders `*word*` markers as <em>. */
function renderWithEmphasis(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(emphasisPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(<em key={`${keyPrefix}-em-${index}`}>{match[1]}</em>);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function ProjectParagraph({ children }: { children: string }) {
  const paragraph = normalizeProjectParagraph(children);
  let nodes: ReactNode[] = [paragraph];
  nodes = transformTextNodes(nodes, renderWithMarkdownLinks);
  nodes = transformTextNodes(nodes, renderWithAutoLinks);
  nodes = transformTextNodes(nodes, renderWithBold);
  nodes = transformTextNodes(nodes, renderWithEmphasis);

  return (
    <p className='text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7'>
      {nodes}
    </p>
  );
}

function ProjectQuote({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <blockquote className='my-2 border-s-2 border-[#7f242a]/40 py-1 ps-5 italic sm:my-3 sm:ps-6'>
      <p className='text-sm leading-6 text-[#24211d] sm:text-base sm:leading-7'>
        {text}
      </p>
      {attribution && (
        <footer className='mt-3 text-sm not-italic leading-6 text-[#777066]'>
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4'
    >
      <rect x='3' y='3' width='18' height='18' rx='5' />
      <circle cx='12' cy='12' r='4' />
      <circle cx='17.2' cy='6.8' r='0.6' fill='currentColor' stroke='none' />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4'
    >
      <path d='M21 4 3 11.2l6 2.1M21 4l-3.2 16-6-4.5M21 4 9.3 13.3M9 13.3v5l2.7-2.7' />
    </svg>
  );
}

function ProjectContact({
  label,
  links,
}: {
  label: string;
  links: { platform: string; handle: string; url: string }[];
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col gap-2'>
      <p className='text-sm font-semibold text-black sm:text-base'>{label}</p>
      <ul className='flex flex-col gap-2'>
        {links.map((link) => (
          <li key={`${link.platform}-${link.handle}`}>
            <a
              href={link.url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 text-sm text-[#24211d] transition-colors hover:text-[#7f242a] sm:text-base'
            >
              {link.platform === 'instagram' ? <InstagramIcon /> : <TelegramIcon />}
              {link.handle}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const rawProject = getProjectBySlug(slug);

  if (!rawProject) {
    notFound();
  }

  const dict = getDictionary(lang);
  const project = localizeProject(rawProject, lang);
  const basicInformation = project['1. Basic Information'];
  const title = basicInformation['Project Title'];
  const artists =
    basicInformation[
      'Artist / Group / Collective / Organizer / Supervisor / Initiator'
    ];
  const location = basicInformation.Location.text;
  const year = basicInformation['Year / Time Period'].text;
  const tags = basicInformation['Thematic Tags'] ?? [];
  const imageSrc = getProjectImage(project);
  const imageAlt = basicInformation['Featured Project Image'].alt || title;
  const mediaItems = getProjectMedia(project);
  const reReading = getProjectReReading(project.slug);
  const introductionSection = project.sections.find(
    (section) => section.id === '2',
  );
  const openingSections = project.sections.filter(
    (section) => section.id === '3',
  );
  const remainingSections = project.sections.filter(
    (section) =>
      !['2', '3'].includes(section.id) &&
      section.title.toLowerCase() !== 're-readings',
  );

  const hasMetadata = Boolean(year || location || tags.length > 0);

  return (
    <MainLayout>
      <article className='pb-16'>
        <div className='relative -mx-8 h-[38vh] min-h-[260px] overflow-hidden sm:-mx-16 sm:h-[46vh] sm:min-h-[320px] lg:-mx-24'>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes='100vw'
            className='object-cover'
          />
          <div className='absolute inset-0 bg-[#d67878]/68 mix-blend-multiply' />
          <div className='absolute inset-0 bg-black/20 mix-blend-color-burn' />
          <div
            aria-hidden='true'
            className='absolute inset-0 opacity-25 mix-blend-multiply'
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
              backgroundSize: '4px 4px',
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-[rgb(248,248,246)] via-black/10 to-black/35' />
          <div className='absolute inset-x-0 bottom-0 flex flex-col gap-2 px-8 pb-6 sm:px-16 sm:pb-8 lg:px-24'>
            <h1 className='text-4xl font-bold leading-[0.95] text-black sm:text-5xl lg:text-6xl'>
              {title}
            </h1>
            {artists.length > 0 && (
              <p className='text-lg font-medium leading-6 text-black sm:text-xl'>
                {artists.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div id='project-hero-sentinel' aria-hidden='true' />

        {hasMetadata && (
          <dl className='mt-6 mb-10 flex flex-wrap gap-x-12 gap-y-6 sm:mt-8 lg:ps-68'>
            {year && (
              <div>
                <dt className='text-sm font-semibold text-black sm:text-base'>
                  {dict.project.periodLabel}
                </dt>
                <dd className='mt-1 text-sm text-[#777066] sm:text-base'>{year}</dd>
              </div>
            )}
            {location && (
              <div className='max-w-xs'>
                <dt className='text-sm font-semibold text-black sm:text-base'>
                  {dict.project.locationLabel}
                </dt>
                <dd className='mt-1 text-sm text-[#777066] sm:text-base'>
                  {location}
                </dd>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <dt className='text-sm font-semibold text-black sm:text-base'>
                  {dict.project.topicsLabel}
                </dt>
                <dd className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-2'>
                  {tags.map((tag, index) => (
                    <Fragment key={tag}>
                      <span className='text-[0.7rem] font-extrabold tracking-wide text-[#7f242a] uppercase sm:text-xs'>
                        {tag}
                      </span>
                      {index < tags.length - 1 && (
                        <span
                          aria-hidden='true'
                          className='h-3.5 w-0.5 shrink-0 bg-[#7f242a] sm:h-4'
                        />
                      )}
                    </Fragment>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}

        {(() => {
          const navSections: { id: string; label: string; content: ReactNode }[] = [];

          if (introductionSection) {
            navSections.push({
              id: 'intro',
              label: introductionSection.title,
              content: (
                <section
                  key='intro'
                  id='intro'
                  className='flex scroll-mt-28 flex-col gap-3'
                >
                  <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                    {introductionSection.title}
                  </h2>
                  {introductionSection.paragraphs.map((paragraph, index) => (
                    <ProjectParagraph key={`${introductionSection.id}-${index}`}>
                      {paragraph}
                    </ProjectParagraph>
                  ))}
                  {introductionSection.quotes?.map((quote, index) => (
                    <ProjectQuote
                      key={`${introductionSection.id}-quote-${index}`}
                      text={quote.text}
                      attribution={quote.attribution}
                    />
                  ))}
                </section>
              ),
            });
          }

          const documentationSection = remainingSections.find(
            (section) => section.title.trim().toLowerCase() === 'documentation',
          );

          // Projects with their own "Documentation" section (e.g. daab, workers)
          // get the media strip placed there, at its natural position in the
          // document. Projects without one fall back to showing it right
          // after the introduction, so their galleries still surface.
          if (!documentationSection && mediaItems.length > 0) {
            navSections.push({
              id: 'documentation',
              label: dict.project.documentationLabel,
              content: (
                <div
                  key='documentation'
                  id='documentation'
                  className='flex scroll-mt-28 flex-col gap-3'
                >
                  <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                    {dict.project.documentationLabel}
                  </h2>
                  <ProjectMediaStrip mediaItems={mediaItems} title={title} />
                </div>
              ),
            });
          }

          openingSections.forEach((section) => {
            navSections.push({
              id: `section-${section.id}`,
              label: section.title,
              content: (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className='flex scroll-mt-28 flex-col gap-3'
                >
                  <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <ProjectParagraph key={`${section.id}-${index}`}>
                      {paragraph}
                    </ProjectParagraph>
                  ))}
                  {section.quotes?.map((quote, index) => (
                    <ProjectQuote
                      key={`${section.id}-quote-${index}`}
                      text={quote.text}
                      attribution={quote.attribution}
                    />
                  ))}
                </section>
              ),
            });
          });

          const participationSubsections =
            project['Participation & Process']?.subsections ?? [];

          if (participationSubsections.length > 0) {
            navSections.push({
              id: 'participation',
              label: dict.common.participationProcess,
              content: (
                <div
                  key='participation'
                  id='participation'
                  className='flex scroll-mt-28 flex-col gap-10'
                >
                  {participationSubsections.map((subsection, index) => (
                    <section
                      key={`${subsection.title}-${index}`}
                      className='flex flex-col gap-3'
                    >
                      <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                        {dict.common.participationProcess}
                      </h2>
                      {subsection.title && (
                        <h3 className='text-base font-medium leading-6 text-[#4f4a43] sm:text-lg'>
                          {subsection.title}
                        </h3>
                      )}
                      {subsection.paragraphs.map((paragraph, paragraphIndex) => (
                        <ProjectParagraph
                          key={`${subsection.title}-${index}-${paragraphIndex}`}
                        >
                          {paragraph}
                        </ProjectParagraph>
                      ))}
                    </section>
                  ))}
                </div>
              ),
            });
          }

          // Positioned right after the "Collaborators & Supports" section
          // (id "8"), matching the project's original document order. Falls
          // back to right after Participation & Process for projects that
          // don't have that section, so it's never dropped.
          const reReadingNavEntry = reReading
            ? {
                id: 're-reading',
                label: dict.common.reReading,
                content: (
                  <section key='re-reading' id='re-reading' className='scroll-mt-28'>
                    <div className='relative overflow-hidden border-s-4 border-[#7f242a] bg-[#d67878]/10 p-5 sm:p-7'>
                      <div
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply'
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
                          backgroundSize: '4px 4px',
                        }}
                      />
                      <div className='relative flex flex-col gap-2'>
                        <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                          {dict.common.reReading}
                        </h2>
                        <Link
                          href={localizeHref(lang, `/readings/${project.slug}`)}
                          className='w-fit text-base font-medium leading-6 text-black transition-colors hover:text-[#7f242a] sm:text-lg'
                        >
                          {reReading.title}
                        </Link>
                        <p className='text-sm leading-6 text-[#777066] sm:text-base'>
                          {reReading.author}
                        </p>
                      </div>
                    </div>
                  </section>
                ),
              }
            : null;

          const hasCollaboratorsSection = remainingSections.some(
            (section) => section.id === '8',
          );

          if (reReadingNavEntry && !hasCollaboratorsSection) {
            navSections.push(reReadingNavEntry);
          }

          remainingSections.forEach((section) => {
            const isDocumentationSection =
              documentationSection?.id === section.id;

            navSections.push({
              id: `section-${section.id}`,
              label: section.title,
              content: (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className='flex scroll-mt-28 flex-col gap-3'
                >
                  <h2 className='text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-7'>
                    {section.title}
                  </h2>
                  {isDocumentationSection && mediaItems.length > 0 ? (
                    <ProjectMediaStrip mediaItems={mediaItems} title={title} />
                  ) : (
                    <>
                      {section.paragraphs.map((paragraph, index) => (
                        <ProjectParagraph key={`${section.id}-${index}`}>
                          {paragraph}
                        </ProjectParagraph>
                      ))}
                      {section.quotes?.map((quote, index) => (
                        <ProjectQuote
                          key={`${section.id}-quote-${index}`}
                          text={quote.text}
                          attribution={quote.attribution}
                        />
                      ))}
                      {section.contact && (
                        <ProjectContact
                          label={dict.project.contactLabel}
                          links={section.contact}
                        />
                      )}
                    </>
                  )}
                </section>
              ),
            });

            if (reReadingNavEntry && section.id === '8') {
              navSections.push(reReadingNavEntry);
            }
          });

          return (
            <div className='mt-6 flex flex-col gap-10 sm:mt-8 lg:flex-row lg:items-start lg:gap-24'>
              <ProjectSectionNav
                sections={navSections.map(({ id, label }) => ({ id, label }))}
                ariaLabel={dict.project.sectionsNavLabel}
                revealAfterId='project-hero-sentinel'
              />
              <div className='flex min-w-0 flex-1 flex-col gap-10'>
                {navSections.map((section) => section.content)}
                <p className='text-xs leading-5 text-[#777066] italic sm:text-sm'>
                  {dict.project.editorialNote}
                </p>
              </div>
            </div>
          );
        })()}
      </article>
    </MainLayout>
  );
}
