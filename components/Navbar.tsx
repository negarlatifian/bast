'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'The Project', href: '/theproject' },
  { label: 'Contributions', href: '/contributions' },
  { label: 'Map', href: '/map' },
  { label: 'Discussions', href: '/discussions' },
  { label: 'Public Displays', href: '/publicdisplays' },
  { label: 'About Us', href: '/aboutus' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /* lock body-scroll while menu is open */
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const linkClass = (href: string) =>
    `block py-4 text-[0.75rem] transition-colors
     ${
       pathname === href
         ? 'font-semibold text-[rgb(186,186,186)]'
         : 'text-[rgb(54,54,54)]'
     }
     hover:text-[rgb(254,206,7)]`;

  return (
    <nav className={`  relative z-30 w-fit`}>
      {/* ───── Top bar ───── */}
      <div
        className='mx-auto flex max-w-5xl items-center justify-between
                      px-2 py-2 sm:px-6 '
      >
        {/* desktop links */}
        <div className='hidden gap-2 sm:flex sm:gap-8'>
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
        </div>

        {/* hamburger (mobile only) */}
        <button
          aria-label='Toggle navigation'
          onClick={() => setOpen(!open)}
          className='sm:hidden'
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
          className='fixed inset-0 z-[60] w-screen h-screen bg-white sm:hidden'
        >
          {/*   close (X)   */}
          <button
            aria-label='Close navigation'
            onClick={() => setOpen(false)}
            className='absolute top-4 right-4 rounded-md p-2
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
                className={linkClass(href)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </nav>
  );
}
