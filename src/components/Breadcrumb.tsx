"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Link from "next/link";

const links = [
  { path: "/", label: "Home" },
  { path: "/posts/index", label: "Posts" },
];

export default function Breadcrumb() {
  const segments = useSelectedLayoutSegments();
  console.log(segments);

  return (
    <nav className="text-sm text-gray-500 m-4">
      {links.map((link) => (
        <Link
          href={link.path}
          key={link.path}
          className="hover:text-gray-200 mr-2"
        >
          {"/ " + link.label}
        </Link>
      ))}
      {/* {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        return (
          <Link href={path} key={path}>
            {label}
          </Link>
        );
      })} */}
    </nav>
  );
}
