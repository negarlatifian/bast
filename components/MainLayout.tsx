'use client';

import Link from 'next/link';
import { PropsWithChildren } from 'react';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function MainLayout({ children }: PropsWithChildren) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ---------- Header ---------- */}
      <header className='sticky top-0 z-30 bg-[rgb(248,248,246)]/95 backdrop-blur-md'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8'>
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

          <Navbar />
        </div>
      </header>

      {/* ---------- Main content ---------- */}
      <main className='mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8'>
        {children}
      </main>
    </>
  );
}
