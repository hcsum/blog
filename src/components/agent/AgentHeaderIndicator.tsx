"use client";

import type { CSSProperties } from "react";
import {
  getToneMeta,
  useAgentStatusFeed,
} from "@/lib/agent-status";

export default function AgentHeaderIndicator() {
  const feed = useAgentStatusFeed();
  const tone = getToneMeta(feed.derived.statusTone);
  const label = feed.current.data ? feed.derived.activityLabel : "Agent unavailable";
  const summary = feed.current.data?.summary ?? "Public status feed";

  return (
    <a
      className="agent-indicator shrink-0 rounded-full border border-[color:var(--line)] px-3 py-1.5 transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
      href="/agent"
      style={
        {
          "--agent-tone": tone.accent,
          "--agent-glow": tone.glow,
        } as CSSProperties
      }
      title={summary}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="agent-indicator__ring" cx="12" cy="12" r="8.5" />
        <circle className="agent-indicator__ring agent-indicator__ring--offset" cx="12" cy="12" r="5.5" />
        <circle className="agent-indicator__core" cx="12" cy="12" r="3.2" />
        <path className="agent-indicator__scan" d="M4 12h16" />
      </svg>
      <span className="max-w-[8rem] truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
        {label}
      </span>
    </a>
  );
}
