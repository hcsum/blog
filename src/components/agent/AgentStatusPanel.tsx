"use client";

import type { AgentFeedSnapshot } from "@/lib/agent-status";
import { formatLocalTimestamp, formatPresenceLabel } from "@/lib/agent-status";

type AgentStatusPanelProps = {
  feed: AgentFeedSnapshot;
};

export default function AgentStatusPanel({ feed }: AgentStatusPanelProps) {
  const hasPresenceSnapshot = Boolean(feed.current.data || feed.events.data);
  const tasksHandled = feed.current.data?.stats?.tasksHandled;
  const tasksCompleted = feed.current.data?.stats?.tasksCompleted;
  const tasksFailed = feed.current.data?.stats?.tasksFailed;

  const stats = [
    {
      label: "Presence",
      value: hasPresenceSnapshot ? formatPresenceLabel(feed.derived.presence) : "Waiting",
    },
    {
      label: "Last heartbeat",
      value: formatLocalTimestamp(feed.derived.lastSeenAt),
      compactValue: true,
    },
    {
      label: "Tasks handled",
      value: tasksHandled != null ? String(tasksHandled) : "Waiting",
    },
    {
      label: "Completed / Failed",
      value:
        tasksCompleted != null || tasksFailed != null
          ? `${tasksCompleted ?? 0} / ${tasksFailed ?? 0}`
          : "Waiting",
      compactValue: true,
    },
  ];

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {stats.map((stat) => (
        <article
          className="agent-panel agent-stat-card min-w-0 flex-1 rounded-[1rem] px-5 py-4"
          key={stat.label}
        >
          <p className="agent-data-label text-[color:var(--muted)]">
            {stat.label}
          </p>
          <p
            className={`agent-display mt-3 truncate font-semibold tracking-tight text-[color:var(--foreground)] ${
              stat.compactValue ? "text-base md:text-lg" : "text-2xl md:text-[1.85rem]"
            }`}
          >
            {stat.value}
          </p>
        </article>
      ))}
    </section>
  );
}
