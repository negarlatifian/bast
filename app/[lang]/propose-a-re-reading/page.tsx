import { getFormUrl } from '@/lib/forms';
import { isLocale } from '@/lib/i18n';
import { notFound, redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  redirect(getFormUrl(lang, '/propose-a-re-reading')!);
}
