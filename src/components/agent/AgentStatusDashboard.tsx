"use client";

import AgentCoreVisual from "@/components/agent/AgentCoreVisual";
import AgentEventTimeline from "@/components/agent/AgentEventTimeline";
import AgentStatusPanel from "@/components/agent/AgentStatusPanel";
import { useAgentStatusFeed } from "@/lib/agent-status";

export default function AgentStatusDashboard() {
  const feed = useAgentStatusFeed();

  return (
    <section className="agent-console-shell border-b border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div className="space-y-5">
            <p className="eyebrow">Agent Status</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              A public systems panel for the live agent, with activity context instead of raw logs.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
              This feed reflects the current public-safe snapshot, recent bounded events, and a live visual identity
              that changes with the agent&apos;s state. It refreshes every 15 seconds and deliberately excludes private
              prompts, hidden traces, or fake progress meters.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              <span className="agent-subchip">Current snapshot truth: `current.json`</span>
              <span className="agent-subchip">Recent activity window: `events.json`</span>
              <span className="agent-subchip">Public-safe only</span>
            </div>
          </div>

          <AgentStatusPanel feed={feed} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <AgentCoreVisual
            isStale={feed.derived.isStale}
            status={feed.derived.status}
            tone={feed.derived.statusTone}
          />
          <AgentEventTimeline feed={feed} />
        </div>
      </div>
    </section>
  );
}
