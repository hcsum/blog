import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL ?? "https://hcxu.cc";

export default defineConfig({
  site,
  integrations: [
    mdx(),
    react(),
    // `/en/…` is an alias of the unprefixed English tree and canonicalises to `/…`,
    // so it stays out of the sitemap.
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/en/") }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  vite: {
    server: {
      fs: {
        allow: ["."],
      },
    },
  },
});
