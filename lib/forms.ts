import type { Locale } from '@/lib/i18n';

// External Google Forms, keyed by the internal route that stands in for them.
const formUrls: Record<string, Record<Locale, string>> = {
  '/suggest-a-project': {
    en: 'https://docs.google.com/forms/d/e/1FAIpQLScxX0HPGe_gtY5G0VFHSyOtzLp--i6Tme8mXrRYH8-Hk_L9ow/viewform',
    fa: 'https://docs.google.com/forms/d/e/1FAIpQLSfzRvn4hx2HgJxuOZyEOdO1y3awVGeC5dsohJqSMJ-ixSATJQ/viewform',
  },
  '/propose-a-re-reading': {
    en: 'https://docs.google.com/forms/d/e/1FAIpQLSd-K3w0ddQVgJ0_KY4Cgov7q_6e6-1GY7aujKSVvqtePlfH9w/viewform',
    fa: 'https://docs.google.com/forms/d/e/1FAIpQLScVtyJ21HGhE-tCyj224inq2k0ENqENtMoRHiqTJ-bg_soOzQ/viewform',
  },
};

/** The form URL for an internal route in the given locale, if it has one. */
export function getFormUrl(locale: Locale, href: string): string | undefined {
  return formUrls[href]?.[locale];
}
