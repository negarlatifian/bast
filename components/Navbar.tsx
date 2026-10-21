'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchForm from './SearchForm';
import LanguageSwitcher from './LanguageSwitcher';
import PlusMenu from './PlusMenu';
import { useLocale } from './LocaleProvider';
import { localizeHref } from '@/lib/i18n';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, dict } = useLocale();

  const orderedNavEntries =
    lang === 'fa'
      ? [
          { label: dict.nav.about, href: '/aboutbast' },
          { label: dict.nav.map, href: '/map' },
          { label: dict.nav.library, href: '/library-page' },
          { label: dict.nav.rereading, href: '/readings' },
          { label: dict.nav.repository, href: '/repository' },
        ]
      : [
          { label: dict.nav.repository, href: '/repository' },
          { label: dict.nav.rereading, href: '/readings' },
          { label: dict.nav.library, href: '/library-page' },
          { label: dict.nav.map, href: '/map' },
          { label: dict.nav.about, href: '/aboutbast' },
        ];

  const navItems = orderedNavEntries.map((item) => ({
    ...item,
    href: localizeHref(lang, item.href),
  }));

  const desktopLinkClass = (href: string) =>
    `block py-4 text-[0.95rem] transition-colors
     ${
       pathname === href
         ? 'font-semibold text-[#7f786cbf]'
         : 'text-[rgb(54,54,54)]'
     }
     hover:text-[#7f242a]`;

  return (
    <nav dir='ltr' className='relative z-30 w-fit'>
      {/* ───── Top bar ───── */}

      <div className='nav-bar mx-auto flex items-center justify-between py-2'>
        {/* desktop links */}
        <div className='hidden items-center gap-5 md:flex lg:gap-8'>
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href} className={desktopLinkClass(href)}>
              {label}
            </Link>
          ))}
          <SearchForm collapsible />
          <LanguageSwitcher />
        </div>

        {/* On phones, the home page's "+" index stands in for the links. */}
        <div className='md:hidden'>
          <PlusMenu />
        </div>
      </div>
    </nav>
  );
}
