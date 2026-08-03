import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPostMeta, sortPosts } from "@/lib/blog";
import { PREFIXED_LOCALES, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/ui";

export function getStaticPaths() {
  return PREFIXED_LOCALES.map((lang) => ({ params: { lang } }));
}

export async function GET(context: { site: URL | undefined; params: { lang: string } }) {
  const locale = context.params.lang as Locale;
  const posts = sortPosts(await getCollection("blog", ({ data }) => !data.draft));
  const t = useTranslations(locale);

  return rss({
    title: t("rss.title"),
    description: t("rss.description"),
    site: context.site ?? "https://example.com",
    items: posts.map((post) => {
      const meta = getPostMeta(post, locale);
      return {
        title: meta.title,
        description: meta.description,
        pubDate: meta.publishedAt,
        link: meta.permalink,
      };
    }),
  });
}
