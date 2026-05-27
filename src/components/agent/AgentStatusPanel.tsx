"use client";

import type { CSSProperties } from "react";
import type { AgentFeedSnapshot } from "@/lib/agent-status";
import {
  AGENT_STATUS_POLL_INTERVAL_MS,
  formatLocalTimestamp,
  formatSourceLabel,
  formatTaskTypeLabel,
  getStatusChipLabel,
  getToneMeta,
} from "@/lib/agent-status";

type AgentStatusPanelProps = {
  feed: AgentFeedSnapshot;
};

export default function AgentStatusPanel({ feed }: AgentStatusPanelProps) {
  const tone = getToneMeta(feed.derived.statusTone);
  const current = feed.current.data;
  const source = formatSourceLabel(current?.source);
  const taskType = formatTaskTypeLabel(current?.taskType);

  return (
    <section
      className="agent-panel rounded-[2rem] p-6"
      style={
        {
          "--agent-tone": tone.accent,
          "--agent-glow": tone.glow,
          "--agent-ink": tone.ink,
        } as CSSProperties
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="agent-chip">{getStatusChipLabel(feed.current.data?.status)}</span>
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Snapshot from `current.json`
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight">
          {current?.title ?? "Agent unavailable"}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
          {current?.summary ??
            "This public status layer shows the latest safe snapshot, not private prompts or raw internal traces."}
        </p>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 p-4">
          <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Snapshot time
          </dt>
          <dd className="mt-2 font-mono text-sm text-[color:var(--foreground)]">
            {formatLocalTimestamp(feed.derived.displayTime)}
          </dd>
        </div>
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 p-4">
          <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Refresh cadence
          </dt>
          <dd className="mt-2 font-mono text-sm text-[color:var(--foreground)]">
            {Math.round(AGENT_STATUS_POLL_INTERVAL_MS / 1000)}s polling
          </dd>
        </div>
        {typeof current?.activeCount === "number" ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 p-4">
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Active public tasks
            </dt>
            <dd className="mt-2 font-mono text-sm text-[color:var(--foreground)]">
              {current.activeCount}
            </dd>
          </div>
        ) : null}
        {source ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 p-4">
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Source
            </dt>
            <dd className="mt-2 text-sm text-[color:var(--foreground)]">{source}</dd>
          </div>
        ) : null}
        {taskType ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 p-4 sm:col-span-2">
            <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Task type
            </dt>
            <dd className="mt-2 text-sm text-[color:var(--foreground)]">{taskType}</dd>
          </div>
        ) : null}
      </dl>

      {feed.current.stale ? (
        <p className="mt-6 rounded-2xl border border-[color:var(--agent-tone)]/30 bg-[color:var(--agent-glow)] px-4 py-3 text-sm text-[color:var(--foreground)]">
          Stale data: waiting for the next successful refresh while keeping the latest public snapshot visible.
        </p>
      ) : null}
    </section>
  );
}
