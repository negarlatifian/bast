'use client';

import Link from 'next/link';
import { PropsWithChildren, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type MainLayoutProps = PropsWithChildren<{
  variant?: 'default' | 'reading';
}>;

export default function MainLayout({
  children,
  variant = 'default',
}: MainLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const isReadingVariant = variant === 'reading';
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
    <div className={`min-h-dvh ${backgroundClassName}`}>
      {/* ---------- Header ---------- */}
      <header
        className={`sticky top-0 z-30 ${headerClassName} backdrop-blur-md`}
      >
        <div className='mx-auto flex w-full max-w-none items-center justify-between px-4 py-2 sm:px-6 lg:px-8'>
          <Link
            href='/'
            className='logo-wrapper text-[0.95rem] font-semibold text-black sm:text-xl'
            aria-label='Bast home'
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

          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
        </div>
      </header>

      {/* ---------- Main content ---------- */}
      <main className='mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8'>
        {children}
      </main>
    </div>
  );
}
