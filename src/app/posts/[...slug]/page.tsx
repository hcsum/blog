import fs from "fs";
import path from "path";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "public/generated-content");

  const getFilesRecursively = (
    dir: string,
    relativePath = "",
  ): { slug: string[] }[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const paths: { slug: string[] }[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const currentPath = path.join(
        relativePath,
        entry.name.replace(/\.html$/, ""),
      );

      if (entry.isDirectory()) {
        paths.push(
          ...getFilesRecursively(fullPath, path.join(relativePath, entry.name)),
        );
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        paths.push({ slug: currentPath.split(path.sep) });
      }
    }

    return paths;
  };

  const paths = getFilesRecursively(contentDir);
  return paths;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  // console.log("params", await params);
  const slug = (await params).slug.join("/");
  return {
    title: `Post: ${slug}`,
    description: `Read about ${slug.replace(/-/g, " ")}`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const slugPath = (await params).slug.join("/");
  const filePath = path.join(
    process.cwd(),
    "public/generated-content",
    `${slugPath}.html`,
  );

  if (!fs.existsSync(filePath)) {
    throw new Error("Post not found");
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="prose dark:prose-invert container mx-auto p-4">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
