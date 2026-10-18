'use client';

import Link from 'next/link';
import { PropsWithChildren, Suspense } from 'react';
import Navbar from '../components/Navbar';
import LanguageSwitcher from './LanguageSwitcher';
import PlusMenu from './PlusMenu';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLocale } from './LocaleProvider';
import { localizeHref } from '@/lib/i18n';

const READING_BG_SAMPLES = [
  { name: 'Old gold', color: '#c9a24e' },
  { name: 'Lighter old gold', color: '#d4b264' },
  { name: 'Soft gold', color: '#d8b974' },
  { name: 'Darker old gold', color: '#bb9443' },
  { name: 'Antique brass', color: '#b8964f' },
  { name: 'Muted gold', color: '#bfa262' },
  { name: 'Dusty gold', color: '#c4a868' },
  { name: 'Warm gold', color: '#cf9f45' },
  { name: 'Amber gold', color: '#d19a3c' },
  { name: 'Greenish gold', color: '#bfa448' },
  { name: 'Bronze gold', color: '#ae8840' },
  { name: 'Deep gold', color: '#a8803a' },
];

type MainLayoutProps = PropsWithChildren<{
  variant?: 'default' | 'reading';
  // The home page trades the full nav bar for a single "+" dropdown and
  // moves the language switch to a spine label on the page edge.
  navigation?: 'bar' | 'plus';
  // Project pages float the header over the hero image; it only takes on a
  // background once the hero (marked by #project-hero-sentinel) scrolls away.
  header?: 'solid' | 'overHero';
}>;

export default function MainLayout({
  children,
  variant = 'default',
  navigation = 'bar',
  header = 'solid',
}: MainLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const isOverHero = header === 'overHero';
  const { lang, dict } = useLocale();
  const isReadingVariant = variant === 'reading';
  // On desktop the home page is a single screen: the header and a collage
  // that fills exactly what's left, with nothing to scroll. Below that it
  // scrolls like any other page.
  const isSingleScreen = navigation === 'plus';
  // TEMPORARY: live background picker for choosing the reading-page color.
  // Remove READING_BG_SAMPLES, readingBg and the picker once one is chosen.
  const [readingBg, setReadingBg] = useState(READING_BG_SAMPLES[0].color);
  const backgroundClassName = isReadingVariant ? '' : 'bg-[rgb(248,248,246)]';
  const headerClassName = isOverHero
    ? `fixed inset-x-0 transition-colors duration-300 ${
        pastHero
          ? 'bg-[rgb(248,248,246)]/95 backdrop-blur-md'
          : 'header-on-hero bg-transparent'
      }`
    : `sticky backdrop-blur-md ${
        isReadingVariant ? '' : 'bg-[rgb(248,248,246)]/95'
      }`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      if (isOverHero) {
        const sentinel = document.getElementById('project-hero-sentinel');
        const headerHeight =
          document.querySelector('header')?.getBoundingClientRect().height ??
          0;
        setPastHero(
          !!sentinel && sentinel.getBoundingClientRect().top <= headerHeight,
        );
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOverHero]);

  return (
    <div
      className={`${
        isSingleScreen
          ? 'min-h-dvh lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden'
          : 'min-h-dvh'
      } ${
        // The home collage paints its full-page strips behind the layout,
        // so the layout itself leaves the ground to <body>.
        isSingleScreen ? '' : backgroundClassName
      }`}
      style={isReadingVariant ? { backgroundColor: readingBg } : undefined}
    >
      {isReadingVariant && (
        <div className='fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-white p-3 text-xs shadow-lg'>
          <p className='font-semibold text-black'>Sample background</p>
          {READING_BG_SAMPLES.map((sample) => (
            <button
              key={sample.color}
              type='button'
              onClick={() => setReadingBg(sample.color)}
              className={`flex items-center gap-2 text-start text-black ${
                readingBg === sample.color ? 'font-bold' : ''
              }`}
            >
              <span
                className='h-5 w-5 shrink-0 border border-black/20'
                style={{ backgroundColor: sample.color }}
              />
              {sample.name} {sample.color}
            </button>
          ))}
        </div>
      )}
      <a
        href='#main-content'
        className='sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:inset-s-4 focus-visible:z-50 focus-visible:bg-[#7f242a] focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
      >
        {dict.common.skipToContent}
      </a>

      {/* ---------- Header ---------- */}
      <header
        style={
          isReadingVariant && !isOverHero
            ? { backgroundColor: `${readingBg}f2` }
            : undefined
        }
        className={`top-0 z-30 ${
          isSingleScreen ? 'lg:shrink-0' : ''
        } ${headerClassName} ${
          isSingleScreen
            ? 'lg:static lg:bg-transparent lg:backdrop-blur-none'
            : ''
        }`}
      >
        <div
          dir='ltr'
          className='mx-auto flex w-full max-w-none items-center justify-between px-8 py-2 sm:px-16 lg:px-24'
        >
          <Link
            href={localizeHref(lang, '/')}
            className='logo-wrapper text-[0.95rem] font-semibold text-black sm:text-xl'
            aria-label={dict.common.homeAriaLabel}
          >
            {/* LOGO 1 */}
            <Image
              width={400}
              height={300}
              src='/big.svg'
              alt='Big Logo'
              className={`logo logo1 ${scrolled ? 'hide' : ''}`}
            />

            {/* LOGO 2 */}
            <Image
              width={400}
              height={300}
              src='/small.svg'
              alt='small logo'
              className={`logo logo2 ${scrolled ? 'show' : ''}`}
            />
          </Link>

          {navigation === 'plus' ? (
            <PlusMenu />
          ) : (
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
          )}
        </div>
      </header>

      {/* Language as a spine label, like the lettering down the side of an
          archive box — it sits in the page gutter, clear of the content. */}
      {navigation === 'plus' && (
        <div
          aria-label={dict.common.language}
          role='group'
          dir='ltr'
          className='home-spine fixed bottom-6 left-3 z-30 flex rotate-180 items-center gap-3 [writing-mode:vertical-rl] sm:bottom-10 sm:left-6 lg:left-10'
        >
          <span
            aria-hidden='true'
            className='h-8 w-px bg-[#7f242a]/60'
          />
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      )}

      {/* ---------- Main content ---------- */}
      <main
        id='main-content'
        tabIndex={-1}
        className={`mx-auto w-full max-w-none px-8 outline-none sm:px-16 lg:px-24 ${
          isSingleScreen ? 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col' : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
}
