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
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        <header className="agent-intro max-w-3xl">
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base md:leading-8">
            This shows the live status of my AI agent running on the cloud. I
            interact with it through a Gmail bridge. I send it tasks and it
            picks them up. It also does periodical tasks like sending me morning
            reports containing updates on my favorite websites. The event stream
            below is a public window into its recent activity.
          </p>
          <a
            className="agent-intro__link mt-6"
            href="https://github.com/hcsum/my-opencode-agent"
            rel="noreferrer"
            target="_blank"
          >
            View the repo on GitHub
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 17 17 7M9 7h8v8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </a>
        </header>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <AgentCoreVisual
              hasFetchError={feed.derived.hasFetchError}
              lastKnownStatus={feed.derived.lastKnownStatus}
              presence={feed.derived.presence}
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
