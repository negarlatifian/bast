// Fallback helpers shared by the dictionary loader and the project content
// layer. An "empty" translated value (empty string / empty array / missing)
// falls back to the English source, so Farsi data can be filled in gradually.

export function pickString(base: string, override: unknown): string {
  return typeof override === 'string' && override.trim() !== ''
    ? override
    : base;
}

export function pickArray<T>(base: T[], override: unknown): T[] {
  return Array.isArray(override) && override.length > 0
    ? (override as T[])
    : base;
}
