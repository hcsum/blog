"use client";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  // Decode HTML entities
  // can't browser api as this is a static nextjs build
  // might need to use a library later
  const decodeHtmlEntities = (text: string) => {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/");
  };

  return (
    <div className="mb-8 lg:mb-0">
      <div className="rounded-xl p-5 shadow-sm backdrop-blur-sm lg:sticky lg:top-4">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Table of Contents
        </h2>
        <nav>
          <ul className="space-y-2">
            {headings.map((heading, index) => (
              <li
                key={index}
                style={{ marginLeft: `${(heading.level - 1) * 1.25}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {decodeHtmlEntities(heading.text)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
