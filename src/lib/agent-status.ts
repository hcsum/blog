import { useSyncExternalStore } from "react";

export const AGENT_STATUS_BASE_URL = "https://opencode-agent-status.sumtsui.workers.dev";
export const AGENT_STATUS_CURRENT_URL = `${AGENT_STATUS_BASE_URL}/current.json`;
export const AGENT_STATUS_EVENTS_URL = `${AGENT_STATUS_BASE_URL}/events.json`;
export const AGENT_STATUS_HEALTH_URL = `${AGENT_STATUS_BASE_URL}/health`;
export const AGENT_STATUS_CURRENT_POLL_INTERVAL_MS = 10_000;
export const AGENT_STATUS_EVENTS_POLL_INTERVAL_MS = 20_000;
const MOCK_AGENT_SEED_AT = Date.UTC(2026, 4, 27, 7, 30, 0);

export type AgentPresence = "online" | "stale" | "offline";

export type AgentCurrentStatus = {
  status: string;
  title: string;
  summary?: string;
  updatedAt: string;
  activeCount?: number;
  stats?: {
    tasksHandled?: number;
    tasksCompleted?: number;
    tasksFailed?: number;
  };
  source?: string;
  taskType?: string;
  presence?: AgentPresence;
  lastSeenAt?: string;
  lastKnownStatus?: string;
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
  commitMessage?: string;
  runId?: string;
  actor?: string;
};

export type AgentEventsResponse = {
  updatedAt: string;
  events: AgentEvent[];
  meta?: {
    deploymentFingerprint?: string;
  };
  presence?: AgentPresence;
  lastSeenAt?: string;
};

export type AgentStatusTone =
  | "idle"
  | "active"
  | "researching"
  | "drafting"
  | "knowledge"
  | "deployment"
  | "failed"
  | "stale"
  | "offline"
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
    presence: AgentPresence;
    isActive: boolean;
    isStale: boolean;
    hasFetchError: boolean;
    displayTime: string | null;
    lastSeenAt: string | null;
    lastKnownStatus: string;
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
  stale: { accent: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)", ink: "#311b04" },
  offline: { accent: "#94a3b8", glow: "rgba(148, 163, 184, 0.22)", ink: "#111827" },
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

const mockFrames: Array<{
  current: AgentCurrentStatus;
  events: AgentEvent[];
  fingerprint: string;
}> = [
  {
    current: {
      status: "researching",
      title: "Researching deployment notes",
      summary: "Collecting public context and recent upstream changes before drafting a status summary.",
      updatedAt: new Date(MOCK_AGENT_SEED_AT + 16 * 60 * 1000).toISOString(),
      activeCount: 1,
      stats: {
        tasksHandled: 42,
        tasksCompleted: 36,
        tasksFailed: 6,
      },
      source: "gmail",
      taskType: "research",
      presence: "online",
      lastSeenAt: new Date(MOCK_AGENT_SEED_AT + 16 * 60 * 1000).toISOString(),
    },
    events: [
      {
        id: "deployment-01",
        ts: new Date(MOCK_AGENT_SEED_AT).toISOString(),
        type: "deployment",
        status: "deployment",
        title: "Deployment: b56b255",
        summary: "feat(activity): surface concrete commit message in event stream · by hcsum · run local-demo-000",
        source: "workflow",
        taskType: "scheduled-task",
        commitSha: "b56b255",
        commitMessage: "feat(activity): surface concrete commit message in event stream",
        actor: "hcsum",
      },
      {
        id: "task-received-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 4 * 60 * 1000).toISOString(),
        type: "task_received",
        status: "received",
        title: "Task received",
        summary: "A new request landed through the public email workflow.",
        source: "gmail",
        taskType: "research",
        runId: "local-demo-001",
        actor: "hcsum",
      },
      {
        id: "task-started-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 7 * 60 * 1000).toISOString(),
        type: "task_started",
        status: "running",
        title: "Task started",
        summary: "Execution moved from queue into the active worker slot.",
        source: "gmail",
        taskType: "research",
        runId: "local-demo-001",
        actor: "hcsum",
      },
      {
        id: "skill-loaded-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 10 * 60 * 1000).toISOString(),
        type: "skill_loaded",
        status: "running",
        title: "Skill loaded",
        summary: "Loaded a public-safe skill package for live web access.",
        source: "gmail",
        taskType: "research",
        skillName: "web-access",
        runId: "local-demo-001",
      },
      {
        id: "research-started-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 13 * 60 * 1000).toISOString(),
        type: "research_started",
        status: "researching",
        title: "Research phase started",
        summary: "The agent entered its evidence-gathering phase and is collecting the public inputs it needs.",
        source: "gmail",
        taskType: "research",
        durationMs: 184000,
        runId: "local-demo-001",
      },
    ],
    fingerprint: "local-frame-researching",
  },
  {
    current: {
      status: "drafting",
      title: "Drafting final response",
      summary: "The agent has enough evidence and is converging on a user-facing summary.",
      updatedAt: new Date(MOCK_AGENT_SEED_AT + 31 * 60 * 1000).toISOString(),
      activeCount: 1,
      stats: {
        tasksHandled: 42,
        tasksCompleted: 36,
        tasksFailed: 6,
      },
      source: "scheduler",
      taskType: "scheduled-report",
      presence: "online",
      lastSeenAt: new Date(MOCK_AGENT_SEED_AT + 31 * 60 * 1000).toISOString(),
    },
    events: [
      {
        id: "scheduled-report-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 19 * 60 * 1000).toISOString(),
        type: "scheduled_report_started",
        status: "running",
        title: "Scheduled report started",
        summary: "A recurring report run woke up and started preparing the next delivery.",
        source: "scheduler",
        taskType: "scheduled-report",
        runId: "local-demo-002",
        actor: "scheduler",
      },
      {
        id: "web-data-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 22 * 60 * 1000).toISOString(),
        type: "web_data_started",
        status: "researching",
        title: "Web data collection started",
        summary: "Public web sources are being collected and normalized into a compact brief.",
        source: "scheduler",
        taskType: "scheduled-report",
        skillName: "web-access",
        runId: "local-demo-002",
      },
      {
        id: "knowledge-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 26 * 60 * 1000).toISOString(),
        type: "knowledge_update_started",
        status: "knowledge",
        title: "Knowledge system updated",
        summary: "Relevant notes were pushed into the persistent knowledge layer before the final write-up.",
        source: "scheduler",
        taskType: "knowledge-task",
        skillName: "llm-wiki",
        runId: "local-demo-002",
      },
      {
        id: "draft-started-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 29 * 60 * 1000).toISOString(),
        type: "draft_started",
        status: "drafting",
        title: "Draft started",
        summary: "The response is now being written in public-safe form.",
        source: "scheduler",
        taskType: "scheduled-report",
        durationMs: 132000,
        runId: "local-demo-002",
      },
    ],
    fingerprint: "local-frame-drafting",
  },
  {
    current: {
      status: "failed",
      title: "Task failed safely",
      summary: "A public task hit a recoverable error. The failure summary is intentionally sanitized.",
      updatedAt: new Date(MOCK_AGENT_SEED_AT + 45 * 60 * 1000).toISOString(),
      activeCount: 0,
      stats: {
        tasksHandled: 43,
        tasksCompleted: 36,
        tasksFailed: 7,
      },
      source: "workflow",
      taskType: "email-task",
      presence: "online",
      lastSeenAt: new Date(MOCK_AGENT_SEED_AT + 45 * 60 * 1000).toISOString(),
    },
    events: [
      {
        id: "task-queued-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 34 * 60 * 1000).toISOString(),
        type: "task_queued",
        status: "queued",
        title: "Task queued",
        summary: "A follow-up request was accepted and placed into the public execution queue.",
        source: "workflow",
        taskType: "email-task",
        runId: "local-demo-003",
      },
      {
        id: "task-started-02",
        ts: new Date(MOCK_AGENT_SEED_AT + 37 * 60 * 1000).toISOString(),
        type: "task_started",
        status: "running",
        title: "Task started",
        summary: "Execution began for the queued follow-up task.",
        source: "workflow",
        taskType: "email-task",
        runId: "local-demo-003",
      },
      {
        id: "skill-loaded-02",
        ts: new Date(MOCK_AGENT_SEED_AT + 39 * 60 * 1000).toISOString(),
        type: "skill_loaded",
        status: "running",
        title: "Capability loaded",
        summary: "Loaded a whitelisted capability before attempting the task.",
        source: "workflow",
        taskType: "email-task",
        skillName: "openai-docs",
        runId: "local-demo-003",
      },
      {
        id: "task-failed-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 43 * 60 * 1000).toISOString(),
        type: "task_failed",
        status: "failed",
        title: "Task failed",
        summary: "The task ended unsuccessfully after an upstream dependency returned invalid data.",
        source: "workflow",
        taskType: "email-task",
        durationMs: 288000,
        runId: "local-demo-003",
      },
    ],
    fingerprint: "local-frame-failed",
  },
  {
    current: {
      status: "idle",
      title: "Agent idle",
      summary: "No public task is currently running. The system is waiting for the next safe workload.",
      updatedAt: new Date(MOCK_AGENT_SEED_AT + 58 * 60 * 1000).toISOString(),
      activeCount: 0,
      stats: {
        tasksHandled: 44,
        tasksCompleted: 37,
        tasksFailed: 7,
      },
      source: "scheduler",
      taskType: "scheduled-task",
      presence: "online",
      lastSeenAt: new Date(MOCK_AGENT_SEED_AT + 58 * 60 * 1000).toISOString(),
    },
    events: [
      {
        id: "report-delivered-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 49 * 60 * 1000).toISOString(),
        type: "report_delivered",
        status: "delivered",
        title: "Report delivered",
        summary: "A scheduled brief was delivered successfully.",
        source: "scheduler",
        taskType: "scheduled-report",
        durationMs: 305000,
        runId: "local-demo-002",
      },
      {
        id: "task-completed-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 53 * 60 * 1000).toISOString(),
        type: "task_completed",
        status: "completed",
        title: "Task completed",
        summary: "A previous task finished and the public state was closed cleanly.",
        source: "scheduler",
        taskType: "scheduled-task",
        durationMs: 421000,
        runId: "local-demo-002",
      },
      {
        id: "agent-idle-01",
        ts: new Date(MOCK_AGENT_SEED_AT + 56 * 60 * 1000).toISOString(),
        type: "agent_idle",
        status: "idle",
        title: "Agent idle",
        summary: "No active public task remains after the last delivery.",
        source: "scheduler",
        taskType: "scheduled-task",
      },
    ],
    fingerprint: "local-frame-idle",
  },
];

function buildSnapshot(state: {
  current: EndpointState<AgentCurrentStatus>;
  events: EndpointState<AgentEventsResponse>;
}): AgentFeedSnapshot {
  const status = normalizeStatus(state.current.data?.status);
  const presence = normalizePresence(state.current.data?.presence ?? state.events.data?.presence);
  const isActive =
    presence === "online" &&
    (typeof state.current.data?.activeCount === "number"
      ? state.current.data.activeCount > 0
      : ACTIVE_STATUSES.has(status));
  const eventsNewestFirst = state.events.data ? [...state.events.data.events].reverse() : [];

  return {
    current: state.current,
    events: state.events,
    derived: {
      status,
      statusTone: mapStatusTone(status, presence),
      presence,
      isActive,
      isStale: presence === "stale",
      hasFetchError: !state.current.data && Boolean(state.current.error),
      displayTime:
        state.current.data?.updatedAt ??
        state.current.data?.lastSeenAt ??
        state.events.data?.updatedAt ??
        state.events.data?.lastSeenAt ??
        null,
      lastSeenAt: state.current.data?.lastSeenAt ?? state.events.data?.lastSeenAt ?? null,
      lastKnownStatus: normalizeStatus(state.current.data?.lastKnownStatus),
      activityLabel: getActivityLabel(status, presence),
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
  if (shouldUseLocalAgentMocks()) {
    return getLocalMockResponse<T>(url);
  }

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
  }, AGENT_STATUS_CURRENT_POLL_INTERVAL_MS);

  window.setInterval(() => {
    void refreshEvents();
  }, AGENT_STATUS_EVENTS_POLL_INTERVAL_MS);
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

export function mapStatusTone(status: string, presence: AgentPresence = "online"): AgentStatusTone {
  switch (normalizeStatus(status)) {
    case "offline":
      return "offline";
    case "stale":
      return "stale";
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
      if (presence === "offline") return "offline";
      if (presence === "stale") return "stale";
      return "unavailable";
  }
}

export function getToneMeta(tone: AgentStatusTone): ToneMeta {
  return toneMetaMap[tone];
}

export function normalizeStatus(status?: string | null) {
  return (status ?? "").trim().toLowerCase();
}

export function normalizePresence(presence?: string | null): AgentPresence {
  const normalized = (presence ?? "").trim().toLowerCase();

  if (normalized === "stale" || normalized === "offline") {
    return normalized;
  }

  return "online";
}

export function getActivityLabel(status: string, presence: AgentPresence = "online") {
  if (presence === "offline" && normalizeStatus(status) !== "failed") {
    return "Agent offline";
  }

  if (presence === "stale" && normalizeStatus(status) !== "failed") {
    return "Heartbeat delayed";
  }

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

export function getStatusFallbackTitle(status: string, presence: AgentPresence = "online") {
  if (presence === "offline") return "Agent offline";
  if (presence === "stale") return "Heartbeat delayed";

  switch (normalizeStatus(status)) {
    case "offline":
      return "Agent offline";
    case "stale":
      return "Heartbeat delayed";
    case "deployment":
      return "Deploying a fresh build";
    case "received":
      return "New task received";
    case "queued":
      return "Task queued";
    case "running":
      return "Working through a task";
    case "researching":
      return "Researching the request";
    case "drafting":
      return "Drafting a response";
    case "knowledge":
      return "Updating its knowledge";
    case "completed":
      return "Task completed";
    case "delivered":
      return "Report delivered";
    case "failed":
      return "Task failed safely";
    case "idle":
      return "Agent idle";
    default:
      return "Agent unavailable";
  }
}

export function getStatusFallbackSummary(status: string, presence: AgentPresence = "online") {
  if (presence === "offline") {
    return "The local machine is not heartbeating right now. The last visible task state may no longer be current.";
  }

  if (presence === "stale") {
    return "Heartbeat is late. The agent may still be running, but the public snapshot could already be outdated.";
  }

  switch (normalizeStatus(status)) {
    case "offline":
      return "The local machine is currently unreachable. Treat this as machine-level absence rather than a task failure.";
    case "stale":
      return "The last heartbeat is late, so the returned task state may already be stale.";
    case "deployment":
      return "A new build is rolling out. The agent will be back on task once the deployment settles.";
    case "received":
      return "A new request just landed and is being prepared for execution.";
    case "queued":
      return "A task is waiting in the queue for the next open worker slot.";
    case "running":
      return "The agent is actively executing a task right now.";
    case "researching":
      return "The agent is gathering public context before drafting its response.";
    case "drafting":
      return "The agent has enough evidence and is writing up its response.";
    case "knowledge":
      return "The agent is updating its persistent knowledge layer.";
    case "completed":
      return "The last task finished cleanly. The agent is wrapping up.";
    case "delivered":
      return "A scheduled brief was delivered successfully.";
    case "failed":
      return "The last task hit a recoverable error and stopped safely. Details are intentionally sanitized.";
    case "idle":
      return "No task is currently running. The agent is waiting for the next workload to enter its orbit.";
    default:
      return "The agent status is currently unavailable.";
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

  return humanizeStatus(normalized);
}

export function getEventTypeLabel(type: string) {
  return humanizeStatus(type);
}

export function formatPresenceLabel(presence?: AgentPresence | null) {
  switch (normalizePresence(presence)) {
    case "online":
      return "Online";
    case "stale":
      return "Stale";
    case "offline":
      return "Offline";
  }
}

function shouldUseLocalAgentMocks() {
  if (typeof window === "undefined") return false;

  return import.meta.env.DEV && isLocalHostname(window.location.hostname);
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getLocalMockResponse<T>(url: string): Promise<T> {
  const frame = getLocalMockFrame();

  if (url === AGENT_STATUS_CURRENT_URL) {
    return Promise.resolve(frame.current as T);
  }

  if (url === AGENT_STATUS_EVENTS_URL) {
    return Promise.resolve({
      updatedAt: frame.current.updatedAt,
      events: frame.events,
      meta: {
        deploymentFingerprint: frame.fingerprint,
      },
      presence: frame.current.presence,
      lastSeenAt: frame.current.lastSeenAt,
    } as T);
  }

  throw new Error(`No local mock configured for ${url}`);
}

function getLocalMockFrame() {
  const elapsed = Math.max(Date.now() - MOCK_AGENT_SEED_AT, 0);
  const intervalIndex = Math.floor(elapsed / AGENT_STATUS_CURRENT_POLL_INTERVAL_MS);
  const frameIndex = intervalIndex % mockFrames.length;
  const activeFrame = mockFrames[frameIndex];
  const cumulativeEvents = mockFrames
    .slice(0, frameIndex + 1)
    .flatMap((frame) => frame.events);

  return {
    ...activeFrame,
    events: cumulativeEvents,
  };
}

function humanizeStatus(value: string) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
