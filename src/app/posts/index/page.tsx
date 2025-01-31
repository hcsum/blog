import fs from "fs";
import path from "path";
import Link from "next/link";

export default async function PostsPage() {
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

  // Group links by their first segment
  const groupedLinks = links.reduce(
    (acc, link) => {
      const [firstSegment, ...rest] = link.slug.split("/");
      if (!acc[firstSegment]) {
        acc[firstSegment] = [];
      }
      acc[firstSegment].push({ ...link, remainingPath: rest.join("/") });
      return acc;
    },
    {} as Record<
      string,
      Array<{ slug: string; title: string; remainingPath: string }>
    >,
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4">Posts</h1>
      <div className="space-y-8">
        {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
          <div key={category} className="space-y-2">
            <h2 className="text-xl font-semibold mb-4">
              {category.replace(/-/g, " ")}
            </h2>
            <ul className="space-y-2 ml-4">
              {categoryLinks.map((link) => (
                <li
                  key={link.slug}
                  className="transition-all duration-200 hover:translate-x-2"
                >
                  <Link
                    href={`/posts/${link.slug}`}
                    className="text-gray-700 hover:text-blue-600 text-lg font-medium flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    {link.remainingPath ? (
                      <span className="text-gray-500">
                        {link.remainingPath
                          .split("/")
                          .map((segment, index, array) => (
                            <span key={index}>
                              {segment.replace(/-/g, " ")}
                              {index < array.length - 1 && (
                                <span className="text-gray-400 mx-2">/</span>
                              )}
                            </span>
                          ))}
                      </span>
                    ) : (
                      <span className="text-gray-500">{link.title}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
