"use client";

import { useState, type ComponentType } from "react";
import MiniPlanet from "@/components/lab/MiniPlanet";
import PretextReflowLab from "@/components/lab/PretextReflowLab";
import TiltCard from "@/components/lab/TiltCard";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { useTranslations, type UIKey } from "@/i18n/ui";

interface Demo {
  id: string;
  titleKey: UIKey;
  blurbKey: UIKey;
  tag: string;
  Component: ComponentType<{ lang?: Locale }>;
}

const DEMOS: Demo[] = [
  {
    id: "pretext",
    titleKey: "lab.pretext.title",
    blurbKey: "lab.pretext.description",
    tag: "Todo · Pretext",
    Component: PretextReflowLab,
  },
  {
    id: "planet",
    titleKey: "lab.planet.title",
    blurbKey: "lab.planet.description",
    tag: "WebGL · three.js",
    Component: MiniPlanet,
  },
  {
    id: "tilt",
    titleKey: "lab.tilt.title",
    blurbKey: "lab.tilt.description",
    tag: "CSS · Pointer",
    Component: TiltCard,
  },
];

const PER_PAGE = 3;

interface LabGalleryProps {
  lang?: Locale;
}

export default function LabGallery({ lang = DEFAULT_LOCALE }: LabGalleryProps) {
  const t = useTranslations(lang);
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
                  {t(demo.titleKey)}
                </h2>
                <p
                  className="max-w-2xl text-sm leading-6"
                  style={{ color: "var(--muted)" }}
                >
                  {t(demo.blurbKey)}
                </p>
              </div>
              <div className="glass-panel mt-6 overflow-hidden rounded-[2rem] p-4">
                <DemoComponent lang={lang} />
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
            {t("lab.prev")}
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
            {t("lab.next")}
          </button>
        </nav>
      )}
    </div>
  );
}
