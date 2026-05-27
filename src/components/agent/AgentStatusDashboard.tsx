"use client";

import AgentCoreVisual from "@/components/agent/AgentCoreVisual";
import AgentEventTimeline from "@/components/agent/AgentEventTimeline";
import AgentStatusPanel from "@/components/agent/AgentStatusPanel";
import { useAgentStatusFeed } from "@/lib/agent-status";

export default function AgentStatusDashboard() {
  const feed = useAgentStatusFeed();
  const current = feed.current.data;

  return (
    <section className="agent-console-shell border-b border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <AgentCoreVisual
              isStale={feed.derived.isStale}
              summary={current?.summary}
              status={feed.derived.status}
              title={current?.title}
              tone={feed.derived.statusTone}
            />
            <AgentStatusPanel feed={feed} />
          </div>
          <AgentEventTimeline feed={feed} />
        </div>
      </div>
    </section>
  );
}
