import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bast work',
  description: 'A digital archival website for Bast materials and collections.',
  icons: {
    icon: '/small.svg',
    shortcut: '/small.svg',
    apple: '/small.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={``}>
      <body className={` text-[rgb(54,54,54)]`}>{children}</body>
    </html>
  );
}
