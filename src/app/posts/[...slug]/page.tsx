import fs from "fs";
import path from "path";
import { Metadata } from "next";
import TableOfContents from "@/components/TableOfContents";

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

  // Extract headings without decoding
  const extractHeadings = (htmlContent: string) => {
    const headingRegex = /<h[12][^>]*>(.*?)<\/h[12]>/g;
    const headings: { level: number; text: string; id: string }[] = [];

    let match;
    while ((match = headingRegex.exec(htmlContent)) !== null) {
      const level = parseInt(match[0].charAt(2));
      const text = match[1].replace(/<[^>]+>/g, ""); // Remove any nested HTML tags
      // Create a URL-friendly ID from the heading text
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      headings.push({ level, text, id });
    }
    return headings;
  };

  const headings = extractHeadings(content);

  // Add IDs to the HTML content
  const contentWithIds = content.replace(
    /<h([12])(.*?)>(.*?)<\/h\1>/g,
    (match, level, attrs, text) => {
      const id = text
        .replace(/<[^>]+>/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    },
  );

  return (
    <div className="container mx-auto p-4">
      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-12">
        <TableOfContents headings={headings} />
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
        </div>
      </div>
    </div>
  );
}
