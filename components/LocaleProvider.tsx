'use client';

import { createContext, useContext } from 'react';

import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

type LocaleContextValue = {
  lang: Locale;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  lang,
  dict,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  return (
    <LocaleContext.Provider value={{ lang, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return value;
}
