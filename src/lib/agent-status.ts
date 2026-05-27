import { useSyncExternalStore } from "react";

export const AGENT_STATUS_CURRENT_URL = "https://vps1.hcxu.cc/current.json";
export const AGENT_STATUS_EVENTS_URL = "https://vps1.hcxu.cc/events.json";
export const AGENT_STATUS_POLL_INTERVAL_MS = 15_000;

export type AgentCurrentStatus = {
  status: string;
  title: string;
  summary?: string;
  updatedAt: string;
  activeCount?: number;
  source?: string;
  taskType?: string;
};

export type AgentEvent = {
  id: string;
  ts: string;
  type: string;
  status: string;
  title: string;
  summary?: string;
  source?: string;
  taskType?: string;
  skillName?: string;
  durationMs?: number;
  commitSha?: string;
  runId?: string;
  actor?: string;
};

export type AgentEventsResponse = {
  updatedAt: string;
  events: AgentEvent[];
  meta?: {
    deploymentFingerprint?: string;
  };
};

export type AgentStatusTone =
  | "idle"
  | "active"
  | "researching"
  | "drafting"
  | "knowledge"
  | "deployment"
  | "failed"
  | "unavailable";

type EndpointState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  stale: boolean;
  lastSuccessAt: string | null;
};

export type AgentFeedSnapshot = {
  current: EndpointState<AgentCurrentStatus>;
  events: EndpointState<AgentEventsResponse>;
  derived: {
    status: string;
    statusTone: AgentStatusTone;
    isActive: boolean;
    isStale: boolean;
    displayTime: string | null;
    activityLabel: string;
    eventsNewestFirst: AgentEvent[];
  };
};

type ToneMeta = {
  accent: string;
  glow: string;
  ink: string;
};

const toneMetaMap: Record<AgentStatusTone, ToneMeta> = {
  idle: { accent: "#67e8f9", glow: "rgba(103, 232, 249, 0.34)", ink: "#062635" },
  active: { accent: "#a3e635", glow: "rgba(163, 230, 53, 0.32)", ink: "#14230a" },
  researching: { accent: "#2dd4bf", glow: "rgba(45, 212, 191, 0.34)", ink: "#082721" },
  drafting: { accent: "#fbbf24", glow: "rgba(251, 191, 36, 0.32)", ink: "#2c1b05" },
  knowledge: { accent: "#5eead4", glow: "rgba(94, 234, 212, 0.34)", ink: "#062623" },
  deployment: { accent: "#a78bfa", glow: "rgba(167, 139, 250, 0.34)", ink: "#1a1133" },
  failed: { accent: "#fb7185", glow: "rgba(251, 113, 133, 0.34)", ink: "#350b17" },
  unavailable: { accent: "#94a3b8", glow: "rgba(148, 163, 184, 0.24)", ink: "#111827" },
};

const ACTIVE_STATUSES = new Set([
  "deployment",
  "received",
  "queued",
  "running",
  "researching",
  "drafting",
  "knowledge",
]);

const initialEndpointState = <T,>(): EndpointState<T> => ({
  data: null,
  error: null,
  loading: false,
  stale: false,
  lastSuccessAt: null,
});

let snapshot: AgentFeedSnapshot = buildSnapshot({
  current: initialEndpointState<AgentCurrentStatus>(),
  events: initialEndpointState<AgentEventsResponse>(),
});

const listeners = new Set<() => void>();
let hasStartedPolling = false;
let currentRequest: Promise<void> | null = null;
let eventsRequest: Promise<void> | null = null;

function buildSnapshot(state: {
  current: EndpointState<AgentCurrentStatus>;
  events: EndpointState<AgentEventsResponse>;
}): AgentFeedSnapshot {
  const status = normalizeStatus(state.current.data?.status);
  const isActive =
    typeof state.current.data?.activeCount === "number"
      ? state.current.data.activeCount > 0
      : ACTIVE_STATUSES.has(status);
  const isStale = state.current.stale || state.events.stale;
  const eventsNewestFirst = state.events.data ? [...state.events.data.events].reverse() : [];

  return {
    current: state.current,
    events: state.events,
    derived: {
      status,
      statusTone: mapStatusTone(status),
      isActive,
      isStale,
      displayTime: state.current.data?.updatedAt ?? state.events.data?.updatedAt ?? null,
      activityLabel: getActivityLabel(status),
      eventsNewestFirst,
    },
  };
}

function emit(nextState: {
  current: EndpointState<AgentCurrentStatus>;
  events: EndpointState<AgentEventsResponse>;
}) {
  snapshot = buildSnapshot(nextState);
  listeners.forEach((listener) => listener());
}

function updateState(
  key: "current" | "events",
  updater: (
    previous: EndpointState<AgentCurrentStatus> | EndpointState<AgentEventsResponse>,
  ) => EndpointState<AgentCurrentStatus> | EndpointState<AgentEventsResponse>,
) {
  emit({
    current:
      key === "current"
        ? (updater(snapshot.current) as EndpointState<AgentCurrentStatus>)
        : snapshot.current,
    events:
      key === "events"
        ? (updater(snapshot.events) as EndpointState<AgentEventsResponse>)
        : snapshot.events,
  });
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function refreshCurrent() {
  if (currentRequest) return currentRequest;

  updateState("current", (previous) => ({
    ...(previous as EndpointState<AgentCurrentStatus>),
    loading: true,
    error: null,
  }));

  currentRequest = requestJson<AgentCurrentStatus>(AGENT_STATUS_CURRENT_URL)
    .then((data) => {
      updateState("current", (previous) => ({
        ...(previous as EndpointState<AgentCurrentStatus>),
        data,
        loading: false,
        error: null,
        stale: false,
        lastSuccessAt: new Date().toISOString(),
      }));
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      updateState("current", (previous) => ({
        ...(previous as EndpointState<AgentCurrentStatus>),
        loading: false,
        error: message,
        stale: true,
      }));
    })
    .finally(() => {
      currentRequest = null;
    });

  return currentRequest;
}

async function refreshEvents() {
  if (eventsRequest) return eventsRequest;

  updateState("events", (previous) => ({
    ...(previous as EndpointState<AgentEventsResponse>),
    loading: true,
    error: null,
  }));

  eventsRequest = requestJson<AgentEventsResponse>(AGENT_STATUS_EVENTS_URL)
    .then((data) => {
      updateState("events", (previous) => ({
        ...(previous as EndpointState<AgentEventsResponse>),
        data,
        loading: false,
        error: null,
        stale: false,
        lastSuccessAt: new Date().toISOString(),
      }));
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      updateState("events", (previous) => ({
        ...(previous as EndpointState<AgentEventsResponse>),
        loading: false,
        error: message,
        stale: true,
      }));
    })
    .finally(() => {
      eventsRequest = null;
    });

  return eventsRequest;
}

function startPolling() {
  if (hasStartedPolling || typeof window === "undefined") return;

  hasStartedPolling = true;
  void refreshCurrent();
  void refreshEvents();

  window.setInterval(() => {
    void refreshCurrent();
    void refreshEvents();
  }, AGENT_STATUS_POLL_INTERVAL_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  startPolling();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useAgentStatusFeed() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function mapStatusTone(status: string): AgentStatusTone {
  switch (normalizeStatus(status)) {
    case "deployment":
      return "deployment";
    case "running":
    case "queued":
    case "received":
    case "completed":
    case "delivered":
      return "active";
    case "researching":
      return "researching";
    case "drafting":
      return "drafting";
    case "knowledge":
      return "knowledge";
    case "failed":
      return "failed";
    case "idle":
      return "idle";
    default:
      return "unavailable";
  }
}

export function getToneMeta(tone: AgentStatusTone): ToneMeta {
  return toneMetaMap[tone];
}

export function normalizeStatus(status?: string | null) {
  return (status ?? "").trim().toLowerCase();
}

export function getActivityLabel(status: string) {
  switch (normalizeStatus(status)) {
    case "deployment":
      return "Deploying update";
    case "received":
      return "Task received";
    case "queued":
      return "Task queued";
    case "running":
      return "Agent running";
    case "researching":
      return "Researching";
    case "drafting":
      return "Drafting response";
    case "knowledge":
      return "Updating knowledge";
    case "completed":
      return "Task completed";
    case "delivered":
      return "Report delivered";
    case "failed":
      return "Attention required";
    case "idle":
      return "Agent idle";
    default:
      return "Agent unavailable";
  }
}

export function formatLocalTimestamp(value?: string | null) {
  if (!value) return "Waiting for first snapshot";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatSourceLabel(value?: string) {
  if (!value) return null;

  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTaskTypeLabel(value?: string) {
  if (!value) return null;

  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDuration(durationMs?: number) {
  if (!durationMs || durationMs < 1_000) return null;

  const totalSeconds = Math.round(durationMs / 1_000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function getEventTone(event: AgentEvent): AgentStatusTone {
  if (event.type === "deployment") return "deployment";
  if (event.status === "failed" || event.type === "task_failed") return "failed";
  if (event.status === "researching" || event.type === "research_started") return "researching";
  if (event.status === "drafting" || event.type === "draft_started") return "drafting";
  if (event.status === "knowledge" || event.type === "knowledge_update_started") return "knowledge";
  if (event.status === "idle" || event.type === "agent_idle") return "idle";
  return mapStatusTone(event.status);
}

export function getStatusChipLabel(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (!normalized) return "Unavailable";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getEventTypeLabel(type: string) {
  return type
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
