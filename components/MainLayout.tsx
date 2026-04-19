'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';
import Navbar from '../components/Navbar';

export default function MainLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `transition-colors hover:text-black ${
      pathname === href ? 'text-black' : 'text-gray-600'
    }`;

  return (
    <>
      {/* ---------- Header ---------- */}
      <header className='sticky top-0 z-30 bg-white/90 backdrop-blur'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:mt-0 sm:mr-0 sm:ml-[10rem] mt-3 ml-6 mr-1'>
          <Link
            href='/'
            className='sm:text-xl text-[0.95rem] font-semibold text-black'
          >
            {/* Title */}
          </Link>

          <Navbar />
        </div>
      </header>

      {/* ---------- Main content ---------- */}
      <main className='mx-auto w-full max-w-5xl'>{children}</main>
    </>
  );
}
