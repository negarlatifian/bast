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

type MainLayoutProps = PropsWithChildren<{
  variant?: 'default' | 'reading';
  // The home page trades the full nav bar for a single "+" dropdown and
  // moves the language switch to a spine label on the page edge.
  navigation?: 'bar' | 'plus';
}>;

export default function MainLayout({
  children,
  variant = 'default',
  navigation = 'bar',
}: MainLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const { lang, dict } = useLocale();
  const isReadingVariant = variant === 'reading';
  // On desktop the home page is a single screen: the header and a collage
  // that fills exactly what's left, with nothing to scroll. Below that it
  // scrolls like any other page.
  const isSingleScreen = navigation === 'plus';
  const backgroundClassName = isReadingVariant
    ? 'bg-[#8a8c84]'
    : 'bg-[rgb(248,248,246)]';
  const headerClassName = isReadingVariant
    ? 'bg-[#8a8c84]/95'
    : 'bg-[rgb(248,248,246)]/95';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    >
      <a
        href='#main-content'
        className='sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:inset-s-4 focus-visible:z-50 focus-visible:bg-[#7f242a] focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
      >
        {dict.common.skipToContent}
      </a>

      {/* ---------- Header ---------- */}
      <header
        className={`sticky top-0 z-30 ${
          isSingleScreen ? 'lg:shrink-0' : ''
        } ${headerClassName} backdrop-blur-md ${
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
          className='home-spine fixed bottom-6 z-30 flex rotate-180 items-center gap-3 [writing-mode:vertical-rl] ltr:left-3 rtl:right-3 sm:bottom-10 sm:ltr:left-6 sm:rtl:right-6 lg:ltr:left-10 lg:rtl:right-10'
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
