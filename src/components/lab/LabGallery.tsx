"use client";

import { useState, type ComponentType } from "react";
import MiniPlanet from "@/components/lab/MiniPlanet";
import PretextReflowLab from "@/components/lab/PretextReflowLab";
import TiltCard from "@/components/lab/TiltCard";

interface Demo {
  id: string;
  title: string;
  blurb: string;
  tag: string;
  Component: ComponentType;
}

const DEMOS: Demo[] = [
  {
    id: "planet",
    title: "A tiny low-poly planet",
    blurb:
      "A procedural mini-world — an icosphere pushed into hills, a shell of water, cone-trees and drifting clouds, all generated in code. Drag to orbit; it turns on its own.",
    tag: "WebGL · three.js",
    Component: MiniPlanet,
  },
  {
    id: "tilt",
    title: "Pointer-driven 3D tilt",
    blurb:
      "A no-dependency DOM trick: perspective transforms follow the cursor while a specular glare tracks it across the surface.",
    tag: "CSS · Pointer",
    Component: TiltCard,
  },
  {
    id: "pretext",
    title: "Gravity todo list",
    blurb:
      "A small @chenglou/pretext experiment: every todo is measured as real multiline text, so checking one off breaks it into letters that drop and pile up below. Undo lifts them back into place.",
    tag: "Todo · Pretext",
    Component: PretextReflowLab,
  },
];

const PER_PAGE = 3;

export default function LabGallery() {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(DEMOS.length / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = DEMOS.slice(start, start + PER_PAGE);

  return (
    <div>
      <div className="flex flex-col gap-12">
        {visible.map((demo, i) => {
          const DemoComponent = demo.Component;
          return (
            <section key={demo.id}>
              <div className="flex flex-col gap-1">
                <p
                  className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
                  style={{ color: "var(--accent)" }}
                >
                  <span style={{ opacity: 0.7 }}>
                    {String(start + i + 1).padStart(2, "0")} ·{" "}
                  </span>
                  {demo.tag}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {demo.title}
                </h2>
                <p
                  className="max-w-2xl text-sm leading-6"
                  style={{ color: "var(--muted)" }}
                >
                  {demo.blurb}
                </p>
              </div>
              <div className="glass-panel mt-6 overflow-hidden rounded-[2rem] p-4">
                <DemoComponent />
              </div>
            </section>
          );
        })}
      </div>

      {pageCount > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-40"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            Prev
          </button>
          {Array.from({ length: pageCount }).map((_, i) => {
            const isActive = i === page;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-current={isActive ? "page" : undefined}
                className="h-9 w-9 rounded-full border text-sm font-medium transition"
                style={{
                  borderColor: isActive ? "var(--accent)" : "var(--line)",
                  color: isActive ? "var(--background)" : "var(--muted)",
                  background: isActive ? "var(--foreground)" : "transparent",
                }}
              >
                {i + 1}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-40"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
