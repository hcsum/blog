"use client";

import type { CSSProperties } from "react";
import {
  normalizeStatus,
  getToneMeta,
  useAgentStatusFeed,
} from "@/lib/agent-status";
import { DEFAULT_LOCALE, localizePath, type Locale } from "@/i18n/config";
import { useTranslations, type UIKey } from "@/i18n/ui";

interface AgentHeaderIndicatorProps {
  compact?: boolean;
  lang?: Locale;
}

export default function AgentHeaderIndicator({
  compact = false,
  lang = DEFAULT_LOCALE,
}: AgentHeaderIndicatorProps) {
  const t = useTranslations(lang);
  const feed = useAgentStatusFeed();
  const tone = getToneMeta(feed.derived.statusTone);
  const label = feed.current.data
    ? t(getHeaderLabelKey(feed.derived.status, feed.derived.presence))
    : t("agent.header.unavailable");
  const summary = feed.current.data?.summary ?? t("agent.header.feed");
  const className = compact
    ? "agent-indicator shrink-0 rounded-full border border-[color:var(--line)] p-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
    : "agent-indicator shrink-0 rounded-full border border-[color:var(--line)] px-3 py-1.5 transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]";

  return (
    <a
      aria-label={`${label}. ${summary}`}
      className={className}
      href={localizePath("/agent", lang)}
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
        className={`${compact ? "h-[1.125rem] w-[1.125rem]" : "h-5 w-5"} shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="agent-indicator__ring" cx="12" cy="12" r="8.5" />
        <circle className="agent-indicator__ring agent-indicator__ring--offset" cx="12" cy="12" r="5.5" />
        <circle className="agent-indicator__core" cx="12" cy="12" r="3.2" />
        <path className="agent-indicator__scan" d="M4 12h16" />
      </svg>
      {!compact ? (
        <span className="max-w-[8rem] truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      ) : null}
    </a>
  );
}

function getHeaderLabelKey(status: string, presence = "online"): UIKey {
  if (presence === "offline" && normalizeStatus(status) !== "failed") {
    return "agent.header.offline";
  }

  if (presence === "stale" && normalizeStatus(status) !== "failed") {
    return "agent.header.stale";
  }

  switch (normalizeStatus(status)) {
    case "idle":
      return "agent.header.idle";
    case "researching":
      return "agent.header.researching";
    case "drafting":
    case "running":
    case "queued":
    case "received":
    case "completed":
    case "delivered":
      return "agent.header.responding";
    case "knowledge":
      return "agent.header.learning";
    case "deployment":
      return "agent.header.updating";
    case "failed":
      return "agent.header.degraded";
    default:
      return "agent.header.active";
  }
}
