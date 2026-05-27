"use client";

import type { CSSProperties } from "react";
import type { AgentFeedSnapshot } from "@/lib/agent-status";
import {
  formatDuration,
  formatLocalTimestamp,
  formatSourceLabel,
  formatTaskTypeLabel,
  getEventTone,
  getEventTypeLabel,
  getStatusChipLabel,
  getToneMeta,
} from "@/lib/agent-status";

type AgentEventTimelineProps = {
  feed: AgentFeedSnapshot;
};

export default function AgentEventTimeline({ feed }: AgentEventTimelineProps) {
  const events = feed.derived.eventsNewestFirst;

  return (
    <section className="agent-panel rounded-[2rem] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Recent Activity</p>
          <h2 className="text-2xl font-semibold tracking-tight">Public event timeline</h2>
        </div>
        <p className="text-right text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Newest first
        </p>
      </div>

      {feed.events.stale ? (
        <p className="mt-5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 px-4 py-3 text-sm text-[color:var(--muted)]">
          Showing the last successful event window while the feed retries `events.json`.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {events.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-[color:var(--line)] px-5 py-8 text-sm text-[color:var(--muted)]">
            No public events yet. The timeline will populate after the first published activity snapshot lands.
          </div>
        ) : (
          events.map((event) => {
            const tone = getToneMeta(getEventTone(event));
            const source = formatSourceLabel(event.source);
            const taskType = formatTaskTypeLabel(event.taskType);
            const duration = formatDuration(event.durationMs);
            const isIdle = event.type === "agent_idle";

            return (
              <article
                className="agent-event-card rounded-[1.6rem] border border-[color:var(--line)] p-5"
                key={event.id}
                style={
                  {
                    "--agent-tone": tone.accent,
                    "--agent-glow": tone.glow,
                    "--agent-ink": tone.ink,
                    opacity: isIdle ? 0.82 : 1,
                  } as CSSProperties
                }
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="agent-chip">{getStatusChipLabel(event.status)}</span>
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    {getEventTypeLabel(event.type)}
                  </span>
                  <span className="ml-auto font-mono text-xs text-[color:var(--muted)]">
                    {formatLocalTimestamp(event.ts)}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                  {event.title}
                </h3>

                {event.summary ? (
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{event.summary}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {source ? <span className="agent-subchip">{source}</span> : null}
                  {taskType ? <span className="agent-subchip">{taskType}</span> : null}
                  {event.skillName ? <span className="agent-subchip">Capability: {event.skillName}</span> : null}
                  {duration ? <span className="agent-subchip">Duration: {duration}</span> : null}
                  {event.commitSha ? <span className="agent-subchip">Commit: {event.commitSha.slice(0, 7)}</span> : null}
                  {event.actor ? <span className="agent-subchip">Actor: {event.actor}</span> : null}
                  {event.runId ? <span className="agent-subchip">Run: {event.runId}</span> : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
