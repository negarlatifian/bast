import en from '@/dictionaries/en.json';
import fa from '@/dictionaries/fa.json';

import type { Locale } from './i18n';

// English is the source of truth for the shape and the fallback for any
// untranslated value, so the public dictionary type is derived from it.
export type Dictionary = typeof en;

const raw: Record<Locale, unknown> = { en, fa };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value)
  );
}

/**
 * Overlay `override` on top of `base`, but treat "empty" override values
 * (empty string, empty array, missing key) as untranslated and keep the
 * English base. This lets fa.json be filled in gradually.
 */
function mergeWithFallback<T>(base: T, override: unknown): T {
  if (isPlainObject(base)) {
    const result: Record<string, unknown> = {};
    const over = isPlainObject(override) ? override : {};
    for (const key of Object.keys(base)) {
      result[key] = mergeWithFallback(
        (base as Record<string, unknown>)[key],
        over[key],
      );
    }
    return result as T;
  }

  if (Array.isArray(base)) {
    return Array.isArray(override) && override.length > 0
      ? (override as T)
      : base;
  }

  if (typeof base === 'string') {
    return typeof override === 'string' && override.trim() !== ''
      ? (override as T)
      : base;
  }

  return override === undefined ? base : (override as T);
}

export function getDictionary(locale: Locale): Dictionary {
  return mergeWithFallback(en, raw[locale]);
}
