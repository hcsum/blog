import fs from "fs";
import path from "path";
import Link from "next/link";

export default function PostsPage() {
  const contentDir = path.join(process.cwd(), "public/generated-content");

  const getLinksRecursively = (
    dir: string,
    relativePath = "",
  ): { slug: string; title: string }[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const links: { slug: string; title: string }[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const currentPath = path.join(
        relativePath,
        entry.name.replace(/\.html$/, ""),
      );

      if (entry.isDirectory()) {
        links.push(
          ...getLinksRecursively(fullPath, path.join(relativePath, entry.name)),
        );
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        links.push({
          slug: currentPath,
          title: currentPath.replace(/-/g, " ").replace(/\//g, " - "),
        });
      }
    }

    return links;
  };

  const links = getLinksRecursively(contentDir);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.slug}>
            <Link
              href={`/posts/${link.slug}`}
              className="text-blue-600 hover:underline"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
