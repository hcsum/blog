import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPostMeta, sortPosts } from "@/lib/blog";

export async function GET(context: { site: URL | undefined }) {
  const posts = sortPosts(await getCollection("blog", ({ data }) => !data.draft));

  return rss({
    title: "Haochen Xu",
    description: "Writing about web engineering, frontend experiments, and whatever is worth understanding deeply.",
    site: context.site ?? "https://example.com",
    items: posts.map((post) => {
      const meta = getPostMeta(post);
      return {
        title: meta.title,
        description: meta.description,
        pubDate: meta.publishedAt,
        link: meta.permalink,
      };
    }),
  });
}
