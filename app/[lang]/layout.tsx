import type { Metadata } from 'next';
import { Mirza } from 'next/font/google';
import { notFound } from 'next/navigation';

import '../globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getDictionary } from '@/lib/dictionaries';
import { getDirection, isLocale, locales } from '@/lib/i18n';
import { defaultOgImage, siteDescription, siteName, siteUrl } from '@/lib/seo';

// Farsi display face — see the `:lang(fa)` rule in globals.css.
const mirza = Mirza({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mirza',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
  },
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
    <html lang={lang} dir={getDirection(lang)} className={mirza.variable}>
      <body className='text-[rgb(54,54,54)]'>
        <LocaleProvider lang={lang} dict={dict}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
