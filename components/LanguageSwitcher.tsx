'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { useLocale } from './LocaleProvider';
import { localeNames, locales, switchLocaleInPath } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { lang } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  return (
    <div className='flex items-center gap-2 text-[0.9rem]'>
      {locales.map((locale, index) => {
        const isActive = locale === lang;

        return (
          <span key={locale} className='flex items-center gap-2'>
            {index > 0 && <span className='text-black/25'>/</span>}
            <Link
              href={`${switchLocaleInPath(pathname, locale)}${suffix}`}
              aria-current={isActive ? 'true' : undefined}
              className={
                isActive
                  ? 'font-semibold text-[#7f242a]'
                  : 'text-black/55 transition-colors hover:text-[#7f242a]'
              }
            >
              {localeNames[locale]}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
