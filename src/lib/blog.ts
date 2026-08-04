import type { CollectionEntry } from "astro:content";
import { DEFAULT_LOCALE, localizePath, type Locale } from "@/i18n/config";

export type BlogEntry = CollectionEntry<"blog">;

export interface BlogMeta {
  slug: string;
  permalink: string;
  title: string;
  description: string;
  publishedAt?: Date;
  section: string;
  pathSegments: string[];
  readingTime: number;
  tags: string[];
  /** The post ships both a zh and an en body block. */
  bilingual: boolean;
  /** The requested locale actually has its own body block in this post. */
  hasTranslation: boolean;
}

const DATE_LINE_PATTERN = /^Date created:\s*(.+)$/im;
const HEADING_PATTERN = /^#\s+(.+)$/m;
const CJK_PATTERN = /[　-〿㐀-䶿一-鿿＀-￯]/g;
const TAXONOMY_ACRONYMS: Record<string, string> = {
  db: "DB",
  dsa: "DSA",
  js: "JS",
};
const SECTION_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  Agent: { zh: "Agent" },
  Thoughts: { zh: "随想" },
  Notes: { zh: "笔记" },
};

export function getPostMeta(entry: BlogEntry, locale: Locale = DEFAULT_LOCALE): BlogMeta {
  const body = entry.body ?? "";
  const pathSegments = entry.id.split("/");
  const rawSection = pathSegments[0] ?? "notes";
  const bilingual = entry.data.bilingual ?? false;

  const fallbackTitle =
    entry.data.title?.trim() ||
    getFirstHeading(body) ||
    humanize(pathSegments[pathSegments.length - 1] ?? entry.id);
  const localizedTitle = locale === "zh" ? entry.data.titleZh : entry.data.titleEn;
  const title = localizedTitle?.trim() || fallbackTitle;

  const fallbackDescription = entry.data.description?.trim() || getExcerpt(body, fallbackTitle);
  const localizedDescription =
    locale === "zh" ? entry.data.descriptionZh : entry.data.descriptionEn;
  const description = localizedDescription?.trim() || fallbackDescription;

  const publishedAt = entry.data.pubDate ?? entry.data.date ?? getInlineDate(body);
  const tags = entry.data.tags?.length
    ? entry.data.tags
    : pathSegments.slice(0, -1).map(humanizeTaxonomy);
  const englishSection = humanizeTaxonomy(rawSection);

  return {
    slug: entry.id,
    permalink: localizePath(`/posts/${entry.id}/`, locale),
    title,
    description,
    publishedAt,
    section: localizeSection(englishSection, locale),
    pathSegments,
    readingTime: getReadingTime(body, bilingual),
    tags,
    bilingual,
    hasTranslation: bilingual || locale === DEFAULT_LOCALE,
  };
}

export function sortPosts(entries: BlogEntry[]) {
  return [...entries].sort((left, right) => {
    const leftTime = getPostMeta(left).publishedAt?.getTime() ?? 0;
    const rightTime = getPostMeta(right).publishedAt?.getTime() ?? 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.id.localeCompare(right.id);
  });
}

export function groupPostsBySection(entries: BlogEntry[], locale: Locale = DEFAULT_LOCALE) {
  return sortPosts(entries).reduce<Record<string, BlogEntry[]>>((groups, entry) => {
    const { section } = getPostMeta(entry, locale);
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(entry);
    return groups;
  }, {});
}

export function formatDate(date?: Date, locale: Locale = DEFAULT_LOCALE) {
  if (!date) return null;

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    year: "numeric",
    month: locale === "zh" ? "numeric" : "short",
    day: "numeric",
  }).format(date);
}

function localizeSection(section: string, locale: Locale) {
  return SECTION_LABELS[section]?.[locale] ?? section;
}

function getFirstHeading(body: string) {
  const match = body.match(HEADING_PATTERN);
  return match?.[1]?.trim();
}

function getInlineDate(body: string) {
  const match = body.match(DATE_LINE_PATTERN);
  if (!match?.[1]) return undefined;

  const parsed = new Date(match[1].trim());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getExcerpt(body: string, title: string) {
  const stripped = stripMarkdown(body)
    .replace(title, "")
    .replace(DATE_LINE_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.length > 170 ? `${stripped.slice(0, 167).trim()}...` : stripped;
}

function getReadingTime(body: string, bilingual = false) {
  const text = stripMarkdown(body);
  // CJK doesn't split on whitespace, so count characters separately from words.
  const cjkCount = (text.match(CJK_PATTERN) ?? []).length;
  const wordCount = text
    .replace(CJK_PATTERN, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = wordCount / 220 + cjkCount / 450;
  // A bilingual post keeps both language blocks in one body; a reader only reads one.
  const perLanguage = bilingual ? minutes / 2 : minutes;

  return Math.max(1, Math.round(perLanguage));
}

function stripMarkdown(body: string) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+]\([^)]*\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "");
}

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeTaxonomy(value: string) {
  const normalized = value.trim().toLowerCase();
  return TAXONOMY_ACRONYMS[normalized] ?? humanize(value);
}
