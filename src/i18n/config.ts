export const LOCALES = ["en", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** `/` and `/en/…` both serve English; only `/zh/…` is a real content prefix. */
export const UNPREFIXED_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Turn a canonical (unprefixed) path into the path for `locale`.
 * `localizePath("/posts/", "zh") === "/zh/posts/"`
 */
export function localizePath(path: string, locale: Locale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === UNPREFIXED_LOCALE) return normalized;
  return normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
}

/** Strip any locale prefix, giving back the canonical unprefixed path. */
export function canonicalPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const match = normalized.match(/^\/(en|zh)(\/|$)/);
  if (!match) return normalized;
  const rest = normalized.slice(match[1].length + 1);
  return rest === "" ? "/" : rest;
}

export function getLocaleFromPath(path: string): Locale {
  const match = path.match(/^\/(en|zh)(\/|$)/);
  return isLocale(match?.[1]) ? (match[1] as Locale) : DEFAULT_LOCALE;
}

/** The locales that get their own `[lang]`-prefixed route tree. */
export const PREFIXED_LOCALES = LOCALES;
