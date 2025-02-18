import fs from "fs";
import path from "path";
import Link from "next/link";
import groupBy from "lodash/groupBy";

interface LinkItem {
  slug: string;
  title: string;
  remainingPath: string;
  name: string;
}

interface FolderStructure {
  files?: LinkItem[];
  folders?: { [key: string]: FolderStructure };
}

const getLinksRecursively = (dir: string, relativePath = ""): LinkItem[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const links: LinkItem[] = [];

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
        remainingPath: currentPath,
        name: entry.name.replace(/-/g, " "),
      });
    }
  }

  return links;
};

const groupLinksByFirstSegment = (links: LinkItem[]) => {
  return groupBy(
    links.map((link) => ({
      ...link,
      remainingPath: link.slug.split("/").slice(1).join("/"),
      firstSegment: link.slug.split("/")[0],
    })),
    "firstSegment",
  );
};

const organizeLinks = (categoryLinks: LinkItem[]) => {
  const structure: FolderStructure = {};

  categoryLinks.forEach((link) => {
    const segments = link.remainingPath.split("/");
    let current = structure;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (i === segments.length - 1) {
        // It's a file
        if (!current.files) current.files = [];
        current.files.push({ ...link, name: segment });
      } else {
        // It's a folder
        if (!current.folders) current.folders = {};
        if (!current.folders[segment]) {
          current.folders[segment] = {};
        }
        current = current.folders[segment];
      }
    }
  });

  return structure;
};

const RenderFolder = ({
  structure,
  indent = 0,
}: {
  structure: FolderStructure;
  indent?: number;
}) => {
  return (
    <ul className="space-y-2">
      {structure.folders &&
        Object.entries(structure.folders).map(
          ([folderName, content]: [string, FolderStructure]) => (
            <li key={folderName} style={{ marginLeft: `${indent * 1.5}rem` }}>
              <div className="text-gray-700 text-lg font-medium">
                📁 {folderName.replace(/-/g, " ")}
              </div>
              <RenderFolder structure={content} indent={indent + 1} />
            </li>
          ),
        )}
      {structure.files &&
        structure.files.map((file: LinkItem) => (
          <li
            key={file.slug}
            className="transition-all duration-200 hover:translate-x-2"
            style={{ marginLeft: `${indent * 1.5}rem` }}
          >
            <Link
              href={`/posts/${file.slug}`}
              className="text-gray-700 hover:text-blue-600 text-lg font-medium flex items-center group"
            >
              <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
              <span className="text-gray-500">
                {file.name.replace(/-/g, " ")}
              </span>
            </Link>
          </li>
        ))}
    </ul>
  );
};

export default async function PostsPage() {
  const contentDir = path.join(process.cwd(), "public/generated-content");
  const links = getLinksRecursively(contentDir);
  const groupedLinks = groupLinksByFirstSegment(links);

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl bg-white dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4 text-gray-900 dark:text-gray-100">
        Posts
      </h1>
      <div className="space-y-8">
        {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
          <div key={category} className="space-y-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {category.replace(/-/g, " ")}
            </h2>
            <RenderFolder structure={organizeLinks(categoryLinks)} />
          </div>
        ))}
      </div>
    </div>
  );
}
