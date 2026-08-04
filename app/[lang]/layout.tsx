import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import '../globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getDictionary } from '@/lib/dictionaries';
import { getDirection, isLocale, locales } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Bast work',
  description: 'A digital archival website for Bast materials and collections.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);

  return (
    <html lang={lang} dir={getDirection(lang)}>
      <body className='text-[rgb(54,54,54)]'>
        <LocaleProvider lang={lang} dict={dict}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
