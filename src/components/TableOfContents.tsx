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

  // Create a function to decode HTML entities
  const decodeHtmlEntities = (text: string) => {
    // const textarea = document.createElement("textarea");
    // textarea.innerHTML = text;
    // return textarea.value;
    return text;
  };

  return (
    <div className="mb-8 lg:mb-0">
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50 lg:sticky lg:top-4">
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
