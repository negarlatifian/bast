import type { Metadata } from 'next';
import './globals.css';

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
