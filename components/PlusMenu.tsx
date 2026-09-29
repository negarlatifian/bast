'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import LanguageSwitcher from './LanguageSwitcher';
import SearchForm from './SearchForm';
import { useLocale } from './LocaleProvider';
import { formatLocaleNumber, getDirection, localizeHref } from '@/lib/i18n';

function PlusMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' className={className}>
      <path d='M12 1V23M1 12H23' stroke='currentColor' strokeWidth='1.2' />
    </svg>
  );
}

/**
 * The home page's navigation: a single registration-mark "+" that drops a
 * full-screen index over the page — Bast's sections as numbered entries,
 * each drawing a short red thread when pointed at, with search set beside
 * them. On desktop the entries and search sit side by side; on phones and
 * tablets search comes first, the entries follow, and the language switch
 * (which the sheet covers on the page) closes the sheet at the bottom. On
 * short landscape screens the entries split into two columns. The type is
 * sized to the screen, so the sheet only scrolls on the very smallest.
 */
export default function PlusMenu() {
  const { lang, dict } = useLocale();
  const pathname = usePathname();
  const isRtl = getDirection(lang) === 'rtl';
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const navItems = [
    { label: dict.nav.repository, href: '/repository' },
    { label: dict.nav.rereading, href: '/readings' },
    { label: dict.nav.library, href: '/library-page' },
    { label: dict.nav.map, href: '/map' },
    { label: dict.nav.about, href: '/aboutbast' },
  ].map((item) => ({ ...item, href: localizeHref(lang, item.href) }));

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    closeRef.current?.focus();
    document.body.classList.add('overflow-hidden');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const formatIndex = (index: number) =>
    formatLocaleNumber(index + 1, lang).padStart(2, formatLocaleNumber(0, lang));

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        aria-label={dict.common.openMenu}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className='home-plus group flex h-11 w-11 cursor-pointer items-center justify-center text-[#7f242a] transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f242a] sm:h-12 sm:w-12'
      >
        <PlusMark className='h-7 w-7 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 sm:h-8 sm:w-8' />
      </button>

      {/* Portalled to <body>: the header's backdrop blur would otherwise
          become the containing block for a fixed overlay and clip it. */}
      {open &&
        createPortal(
          <div
            id={panelId}
            role='dialog'
            aria-modal='true'
            aria-label={dict.common.openMenu}
            dir={isRtl ? 'rtl' : 'ltr'}
            lang={lang}
            className='plus-menu-sheet fixed inset-0 z-[60] flex h-dvh flex-col overflow-hidden bg-[rgb(248,248,246)] text-[rgb(54,54,54)]'
          >
            {/* Mirrors the page header, so the logo stays put and the
                close mark lands exactly where the plus was. */}
            <div
              dir='ltr'
              className='flex w-full shrink-0 items-center justify-between px-8 py-2 sm:px-16 lg:px-24'
            >
              <Link
                href={localizeHref(lang, '/')}
                onClick={() => setOpen(false)}
                className='logo-wrapper'
                aria-label={dict.common.homeAriaLabel}
              >
                <Image
                  width={400}
                  height={300}
                  src='/big.svg'
                  alt=''
                  className='logo logo1'
                />
              </Link>
              <button
                ref={closeRef}
                type='button'
                aria-label={dict.common.closeMenu}
                onClick={close}
                className='flex h-11 w-11 cursor-pointer items-center justify-center text-[#7f242a] transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f242a] sm:h-12 sm:w-12'
              >
                <PlusMark className='plus-menu-close h-7 w-7 sm:h-8 sm:w-8' />
              </button>
            </div>

            <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-8 pt-2 pb-6 sm:px-16 sm:pt-6 sm:pb-10 lg:grid lg:grid-cols-12 lg:gap-12 lg:overflow-visible lg:px-24 lg:pt-2 lg:pb-16'>
              {/* Search: first on phones and tablets, beside the entries on
                  desktop. */}
              <div
                className='plus-menu-item flex flex-col gap-2 sm:gap-3 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:justify-end lg:pb-3'
                style={{ animationDelay: '120ms' }}
              >
                <p className='mb-auto hidden max-w-sm pt-[18dvh] text-lg leading-snug text-[#777066] lg:block [@media(max-height:680px)]:hidden'>
                  {dict.home.heroTitle}
                </p>
                <p className='flex items-center gap-2 text-[0.7rem] font-extrabold tracking-wide text-[#7f242a] uppercase sm:text-xs'>
                  <PlusMark className='h-2.5 w-2.5 shrink-0' />
                  {dict.search.inputLabel}
                </p>
                <div className='[&_button]:h-10 [&_button]:w-10 [&_form]:w-full [&_form]:border-black/60 [&_input]:w-full [&_input]:py-2 [&_input]:text-lg sm:[&_input]:text-2xl [&_svg]:h-5 [&_svg]:w-5'>
                  <Suspense fallback={null}>
                    <SearchForm onSearch={() => setOpen(false)} />
                  </Suspense>
                </div>
              </div>

              <nav className='mt-8 flex flex-col sm:mt-12 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:min-h-0 lg:justify-center [@media(max-height:500px)]:mt-5'>
                <ol className='flex flex-col border-t border-[#d9d2c7] [@media(max-height:500px)]:grid [@media(max-height:500px)]:grid-cols-2 [@media(max-height:500px)]:gap-x-8'>
                  {navItems.map(({ label, href }, index) => {
                    const isActive = pathname === href;

                    return (
                      <li
                        key={href}
                        className='plus-menu-item border-b border-[#d9d2c7]'
                        style={{ animationDelay: `${180 + index * 60}ms` }}
                      >
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`group flex items-center py-[clamp(0.4rem,1.5dvh,1.1rem)] text-[clamp(1.35rem,min(7vw,5dvh),3.4rem)] leading-tight font-semibold transition-colors hover:text-[#7f242a] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#7f242a] ${
                            isActive ? 'text-[#7f242a]' : 'text-black'
                          }`}
                        >
                          <span className='w-9 shrink-0 self-start pt-[0.6em] text-[0.7rem] sm:w-12 lg:w-16 font-semibold tabular-nums text-[#a39a8d] transition-colors group-hover:text-[#7f242a] sm:text-xs'>
                            {formatIndex(index)}
                          </span>
                          {/* A length of the home page's red thread, drawn
                              out as the entry is pointed at. */}
                          <span
                            aria-hidden='true'
                            className='h-px w-0 shrink-0 bg-[#7f242a] transition-[width,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:me-4 group-hover:w-8 group-focus-visible:me-4 group-focus-visible:w-8 sm:group-hover:me-5 sm:group-hover:w-14 sm:group-focus-visible:me-5 sm:group-focus-visible:w-14'
                          />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div
                className='plus-menu-item mt-auto flex flex-wrap items-center justify-between gap-4 pt-8 lg:hidden [@media(max-height:500px)]:pt-5'
                style={{ animationDelay: `${180 + navItems.length * 60}ms` }}
              >
                <div className='mb-4 hidden basis-full sm:block [@media(max-height:900px)]:hidden'>
                  <p className='max-w-md text-lg leading-snug text-[#777066]'>
                    {dict.home.heroTitle}
                  </p>
                </div>
                <p className='flex items-center gap-2 text-[0.7rem] font-extrabold tracking-wide text-[#7f242a] uppercase sm:text-xs'>
                  <PlusMark className='h-2.5 w-2.5 shrink-0' />
                  {dict.common.language}
                </p>
                <Suspense fallback={null}>
                  <LanguageSwitcher />
                </Suspense>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
