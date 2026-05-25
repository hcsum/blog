import type { CollectionEntry } from "astro:content";

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
}

const DATE_LINE_PATTERN = /^Date created:\s*(.+)$/im;
const HEADING_PATTERN = /^#\s+(.+)$/m;

export function getPostMeta(entry: BlogEntry): BlogMeta {
  const body = entry.body ?? "";
  const pathSegments = entry.id.split("/");
  const section = pathSegments[0] ?? "notes";
  const title =
    entry.data.title?.trim() ||
    getFirstHeading(body) ||
    humanize(pathSegments[pathSegments.length - 1] ?? entry.id);
  const publishedAt = entry.data.pubDate ?? entry.data.date ?? getInlineDate(body);
  const description =
    entry.data.description?.trim() || getExcerpt(body, title);
  const tags = entry.data.tags?.length
    ? entry.data.tags
    : pathSegments.slice(0, -1).map(humanize);

  return {
    slug: entry.id,
    permalink: `/posts/${entry.id}/`,
    title,
    description,
    publishedAt,
    section: humanize(section),
    pathSegments,
    readingTime: getReadingTime(body),
    tags,
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

export function groupPostsBySection(entries: BlogEntry[]) {
  return sortPosts(entries).reduce<Record<string, BlogEntry[]>>((groups, entry) => {
    const { section } = getPostMeta(entry);
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(entry);
    return groups;
  }, {});
}

export function formatDate(date?: Date) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
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

function getReadingTime(body: string) {
  const words = stripMarkdown(body)
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 220));
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
