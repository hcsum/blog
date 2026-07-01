"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentFeedSnapshot } from "@/lib/agent-status";
import {
  formatDuration,
  formatLocalTimestamp,
  formatPresenceLabel,
  formatTaskTypeLabel,
  getEventTone,
  getStatusChipLabel,
  getToneMeta,
} from "@/lib/agent-status";

type AgentEventTimelineProps = {
  feed: AgentFeedSnapshot;
};

const ESTIMATED_CARD_HEIGHT = 196;
const OVERSCAN_COUNT = 3;

export default function AgentEventTimeline({ feed }: AgentEventTimelineProps) {
  const events = feed.derived.eventsNewestFirst;
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousEventIdsRef = useRef<string[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [itemHeights, setItemHeights] = useState<Record<string, number>>({});
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);
  const hasPresenceSnapshot = Boolean(feed.current.data || feed.events.data);
  const timelinePresence = hasPresenceSnapshot ? formatPresenceLabel(feed.derived.presence) : "Waiting";
  const timelineNotice =
    feed.derived.presence === "stale"
      ? "Heartbeat is delayed. This timeline is only a recent public window and may already be behind the live machine."
      : feed.derived.presence === "offline"
        ? "The local agent is offline. This timeline remains available as a recent window, not a cumulative history."
        : feed.events.stale
          ? "Recent activity is waiting on a fresh fetch. Showing the latest cached public window for now."
          : null;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateHeight = () => {
      setViewportHeight(viewport.clientHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const previousIds = previousEventIdsRef.current;
    const previousIdSet = new Set(previousIds);
    const addedIds = events
      .filter((event) => !previousIdSet.has(event.id))
      .map((event) => event.id);

    if (addedIds.length > 0 && previousIds.length > 0) {
      setRecentlyAddedIds(addedIds);
      const timer = window.setTimeout(() => {
        setRecentlyAddedIds([]);
      }, 900);

      previousEventIdsRef.current = events.map((event) => event.id);
      return () => {
        window.clearTimeout(timer);
      };
    }

    previousEventIdsRef.current = events.map((event) => event.id);
  }, [events]);

  const layout = useMemo(() => {
    const offsets: number[] = new Array(events.length);
    let offset = 0;

    for (let index = 0; index < events.length; index += 1) {
      offsets[index] = offset;
      offset += itemHeights[events[index].id] ?? ESTIMATED_CARD_HEIGHT;
    }

    return {
      offsets,
      totalHeight: offset,
    };
  }, [events, itemHeights]);

  const visibleRange = useMemo(() => {
    if (events.length === 0) {
      return { start: 0, end: 0 };
    }

    const startBoundary = Math.max(scrollTop - ESTIMATED_CARD_HEIGHT * OVERSCAN_COUNT, 0);
    const endBoundary =
      scrollTop + Math.max(viewportHeight, ESTIMATED_CARD_HEIGHT) + ESTIMATED_CARD_HEIGHT * OVERSCAN_COUNT;

    let start = 0;
    while (
      start < events.length - 1 &&
      layout.offsets[start] + (itemHeights[events[start].id] ?? ESTIMATED_CARD_HEIGHT) < startBoundary
    ) {
      start += 1;
    }

    let end = start;
    while (end < events.length - 1 && layout.offsets[end] < endBoundary) {
      end += 1;
    }

    return { start, end };
  }, [events, itemHeights, layout.offsets, scrollTop, viewportHeight]);

  const visibleItems = useMemo(() => {
    return events.slice(visibleRange.start, visibleRange.end + 1).map((event, index) => ({
      event,
      index: visibleRange.start + index,
    }));
  }, [events, visibleRange.end, visibleRange.start]);

  const setItemHeight = useCallback((id: string, height: number) => {
    setItemHeights((previous) => {
      if (previous[id] === height) return previous;
      return {
        ...previous,
        [id]: height,
      };
    });
  }, []);

  return (
    <section className="agent-panel agent-stream-panel rounded-[2rem] p-6">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Event Stream</p>
        </div>
        <div className="agent-stream-live">
          <span className="agent-stream-live__dot" />
          <span>{timelinePresence}</span>
        </div>
      </div>

      {timelineNotice ? (
        <p className="mt-5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/70 px-4 py-3 text-sm text-[color:var(--muted)]">
          {timelineNotice}
        </p>
      ) : null}

      <div className="mt-6">
        {events.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-[color:var(--line)] px-5 py-8 text-sm text-[color:var(--muted)]">
            No recent activity yet. The timeline fills in as new public events arrive.
          </div>
        ) : (
          <div className="agent-virtual-list-shell">
            <div
              className="agent-virtual-list overflow-y-auto pr-1"
              onScroll={(event) => {
                setScrollTop(event.currentTarget.scrollTop);
              }}
              ref={viewportRef}
            >
              <div
                className="relative pb-10"
                style={{
                  height: `${layout.totalHeight}px`,
                }}
              >
                {visibleItems.map(({ event, index }) => (
                  <VirtualEventCard
                    event={event}
                    isNew={recentlyAddedIds.includes(event.id)}
                    key={event.id}
                    onHeightChange={setItemHeight}
                    top={layout.offsets[index] ?? 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type VirtualEventCardProps = {
  event: AgentFeedSnapshot["derived"]["eventsNewestFirst"][number];
  isNew: boolean;
  onHeightChange: (id: string, height: number) => void;
  top: number;
};

function VirtualEventCard({ event, isNew, onHeightChange, top }: VirtualEventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tone = getToneMeta(getEventTone(event));
  const taskType = formatTaskTypeLabel(event.taskType);
  const duration = formatDuration(event.durationMs);
  const isIdle = event.type === "agent_idle";

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const update = () => {
      onHeightChange(event.id, element.getBoundingClientRect().height);
    };

    update();

    const observer = new ResizeObserver(() => {
      update();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [event.id, onHeightChange]);

  return (
    <div
      className={`absolute left-0 w-full pb-4 ${isNew ? "agent-event-shell--new" : ""}`}
      ref={cardRef}
      style={{
        top: `${top}px`,
        transition: "top 680ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <article
        className="agent-event-card rounded-[0.625rem] border border-[color:var(--line)] p-5"
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
          <span className="agent-data-value ml-auto text-xs text-[color:var(--muted)]">
            {formatLocalTimestamp(event.ts)}
          </span>
        </div>

        <h3 className="agent-display mt-4 text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
          {event.title}
        </h3>

        {event.summary ? (
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{event.summary}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {taskType ? <span className="agent-subchip">{taskType}</span> : null}
          {duration ? <span className="agent-subchip">{duration}</span> : null}
        </div>
      </article>
    </div>
  );
}
