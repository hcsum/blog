import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content" }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    titleZh: z.string().optional(),
    titleEn: z.string().optional(),
    descriptionZh: z.string().optional(),
    descriptionEn: z.string().optional(),
    ogImage: z.string().optional(),
    ogImageAlt: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    bilingual: z.boolean().optional().default(false),
    // Kept for existing frontmatter; the route decides which language block renders.
    defaultLang: z.enum(["zh", "en"]).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
