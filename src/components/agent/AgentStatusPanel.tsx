"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentFeedSnapshot } from "@/lib/agent-status";
import { formatLocalTimestamp } from "@/lib/agent-status";

type AgentStatusPanelProps = {
  feed: AgentFeedSnapshot;
};

const AGENT_STARTED_AT = "2026-05-27T00:00:00+07:00";

export default function AgentStatusPanel({ feed }: AgentStatusPanelProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const lastDeployment = useMemo(() => {
    return feed.derived.eventsNewestFirst.find((event) => event.type === "deployment")?.ts ?? null;
  }, [feed.derived.eventsNewestFirst]);
  const tasksHandled = feed.current.data?.stats?.tasksHandled;

  const stats = [
    {
      label: "Last deployed",
      value: formatLocalTimestamp(lastDeployment ?? feed.derived.displayTime),
      compactValue: true,
    },
    {
      label: "Uptime",
      value: formatUptime(now),
    },
    {
      label: "Tasks handled",
      value: tasksHandled != null ? String(tasksHandled) : "Waiting",
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

function formatUptime(now: number) {
  const startedAt = new Date(AGENT_STARTED_AT).getTime();
  const diff = Math.max(now - startedAt, 0);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}
