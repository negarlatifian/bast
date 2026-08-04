'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchForm from './SearchForm';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocale } from './LocaleProvider';
import { localizeHref } from '@/lib/i18n';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { lang, dict } = useLocale();

  const navItems = [
    { label: dict.nav.repository, href: '/repository' },
    { label: dict.nav.rereading, href: '/readings' },
    { label: dict.nav.library, href: '/library-page' },
    { label: dict.nav.map, href: '/map' },
    { label: dict.nav.about, href: '/aboutbast' },
  ].map((item) => ({ ...item, href: localizeHref(lang, item.href) }));

  /* lock body-scroll while menu is open */
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const desktopLinkClass = (href: string) =>
    `block py-4 text-[0.95rem] transition-colors
     ${
       pathname === href
         ? 'font-semibold text-[#7f786cbf]'
         : 'text-[rgb(54,54,54)]'
     }
     hover:text-[#7f242a]`;

  const mobileLinkClass = (href: string) =>
    `block py-3 text-2xl transition-colors
     ${
       pathname === href
        ? 'font-semibold text-[#7f242a]'
         : 'text-[rgb(54,54,54)]'
     }
     hover:text-[#7f242a]`;

  return (
    <nav className='relative z-30 w-fit'>
      {/* ───── Top bar ───── */}

      <div className='mx-auto flex items-center justify-between py-2'>
        {/* desktop links */}
        <div className='hidden items-center gap-5 md:flex lg:gap-8'>
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href} className={desktopLinkClass(href)}>
              {label}
            </Link>
          ))}
          <SearchForm />
          <LanguageSwitcher />
        </div>

        {/* hamburger (mobile only) */}
        <button
          aria-label={dict.common.toggleNav}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className='p-2 md:hidden'
        >
          <svg
            className='h-6 w-6 stroke-gray-800'
            fill='none'
            strokeWidth={1.5}
            viewBox='0 0 24 24'
          >
            {open ? (
              <></>
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3 6h18M3 12h18M3 18h18'
              />
            )}
          </svg>
        </button>
      </div>

      {/* ───── Mobile full-screen overlay ───── */}
      {open && (
        <div
          /* absolute root-level sheet */
          className='fixed inset-0 z-[60] min-h-dvh w-screen bg-[rgb(248,248,246)] md:hidden'
        >
          {/*   close (X)   */}
          <button
            aria-label={dict.common.closeNav}
            onClick={() => setOpen(false)}
            className='absolute top-4 end-4 rounded-md p-2
                 transition-colors hover:bg-gray-100 active:scale-95'
          >
            <svg
              className='h-7 w-7 stroke-gray-800'
              fill='none'
              strokeWidth={1.5}
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          {/*   centred nav links   */}
          <nav className='flex min-h-full flex-col items-center justify-center gap-8'>
            {navItems.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={mobileLinkClass(href)}
              >
                {label}
              </Link>
            ))}
            <div className='mt-4 text-xl'>
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </nav>
  );
}
