import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

type StatusMap = Record<string, string>;
type LocaleStatusMap = Record<Locale, StatusMap>;

function pick(map: LocaleStatusMap, locale: Locale, key: string, fallbackKey = "default") {
  return map[locale]?.[key] ?? map[locale]?.[fallbackKey] ?? map[DEFAULT_LOCALE][fallbackKey];
}

const ACTIVITY: LocaleStatusMap = {
  en: {
    active: "Active",
    deployment: "Deploying update",
    received: "Task received",
    queued: "Task queued",
    running: "Agent running",
    researching: "Researching",
    drafting: "Drafting response",
    knowledge: "Updating knowledge",
    completed: "Task completed",
    delivered: "Report delivered",
    failed: "Attention required",
    idle: "Agent idle",
    offlinePresence: "Agent offline",
    stalePresence: "Heartbeat delayed",
    default: "Agent unavailable",
  },
  zh: {
    active: "活跃",
    deployment: "正在部署更新",
    received: "已接收任务",
    queued: "任务排队中",
    running: "Agent 运行中",
    researching: "调研中",
    drafting: "正在起草回复",
    knowledge: "正在更新知识库",
    completed: "任务已完成",
    delivered: "报告已送达",
    failed: "需要关注",
    idle: "Agent 空闲",
    offlinePresence: "Agent 离线",
    stalePresence: "心跳延迟",
    default: "Agent 不可用",
  },
};

const FALLBACK_TITLE: LocaleStatusMap = {
  en: {
    active: "Agent active",
    offline: "Agent offline",
    stale: "Heartbeat delayed",
    deployment: "Deploying a fresh build",
    received: "New task received",
    queued: "Task queued",
    running: "Working through a task",
    researching: "Researching the request",
    drafting: "Drafting a response",
    knowledge: "Updating its knowledge",
    completed: "Task completed",
    delivered: "Report delivered",
    failed: "Task failed safely",
    idle: "Agent idle",
    default: "Agent unavailable",
  },
  zh: {
    active: "Agent 活跃",
    offline: "Agent 离线",
    stale: "心跳延迟",
    deployment: "正在部署新构建",
    received: "收到新任务",
    queued: "任务排队中",
    running: "正在处理任务",
    researching: "正在调研这个请求",
    drafting: "正在起草回复",
    knowledge: "正在更新知识库",
    completed: "任务已完成",
    delivered: "报告已送达",
    failed: "任务已安全失败",
    idle: "Agent 空闲",
    default: "Agent 不可用",
  },
};

const FALLBACK_SUMMARY: LocaleStatusMap = {
  en: {
    active: "The agent is handling a task right now.",
    offlinePresence:
      "The local machine is not heartbeating right now. The last visible task state may no longer be current.",
    stalePresence:
      "Heartbeat is late. The agent may still be running, but the public snapshot could already be outdated.",
    offline:
      "The local machine is currently unreachable. Treat this as machine-level absence rather than a task failure.",
    stale: "The last heartbeat is late, so the returned task state may already be stale.",
    deployment: "A new build is rolling out. The agent will be back on task once the deployment settles.",
    received: "A new request just landed and is being prepared for execution.",
    queued: "A task is waiting in the queue for the next open worker slot.",
    running: "The agent is actively executing a task right now.",
    researching: "The agent is gathering public context before drafting its response.",
    drafting: "The agent has enough evidence and is writing up its response.",
    knowledge: "The agent is updating its persistent knowledge layer.",
    completed: "The last task finished cleanly. The agent is wrapping up.",
    delivered: "A scheduled brief was delivered successfully.",
    failed:
      "The last task hit a recoverable error and stopped safely. Details are intentionally sanitized.",
    idle: "No task is currently running. The agent is waiting for the next workload to enter its orbit.",
    default: "The agent status is currently unavailable.",
  },
  zh: {
    active: "Agent 正在处理任务。",
    offlinePresence: "本地机器现在没有在发心跳，最后看到的任务状态可能已经不是当前状态。",
    stalePresence: "心跳晚了。Agent 可能还在跑，但这个公开快照可能已经过时。",
    offline: "本地机器当前不可达。把它当成机器层面的缺席，而不是任务失败。",
    stale: "最近一次心跳晚了，所以返回的任务状态可能已经陈旧。",
    deployment: "新构建正在发布。部署稳定之后 Agent 会回到任务上。",
    received: "刚落下一个新请求，正在准备执行。",
    queued: "有任务在队列里等下一个空闲的 worker 位。",
    running: "Agent 正在执行任务。",
    researching: "Agent 正在收集公开的上下文，然后才起草回复。",
    drafting: "Agent 拿到的证据够了，正在写回复。",
    knowledge: "Agent 正在更新它的持久知识层。",
    completed: "上一个任务干净地结束了，Agent 正在收尾。",
    delivered: "一份定时简报已成功送达。",
    failed: "上一个任务碰到一个可恢复的错误并安全停下。细节已刻意脱敏。",
    idle: "当前没有任务在跑。Agent 正在等下一个工作负载进入轨道。",
    default: "当前拿不到 Agent 状态。",
  },
};

const PRESENCE: LocaleStatusMap = {
  en: { online: "Online", stale: "Stale", offline: "Offline", default: "Online" },
  zh: { online: "在线", stale: "陈旧", offline: "离线", default: "在线" },
};

const MISC: LocaleStatusMap = {
  en: {
    waitingSnapshot: "Waiting for first snapshot",
    chipUnavailable: "Unavailable",
    default: "",
  },
  zh: {
    waitingSnapshot: "等待第一次快照",
    chipUnavailable: "不可用",
    default: "",
  },
};

export const activityLabel = (locale: Locale, key: string) => pick(ACTIVITY, locale, key);
/** Returns undefined for statuses the dictionary doesn't cover, so callers can humanise instead. */
export const optionalActivityLabel = (locale: Locale, key: string) => ACTIVITY[locale]?.[key];
export const fallbackTitle = (locale: Locale, key: string) => pick(FALLBACK_TITLE, locale, key);
export const fallbackSummary = (locale: Locale, key: string) => pick(FALLBACK_SUMMARY, locale, key);
export const presenceLabel = (locale: Locale, key: string) => pick(PRESENCE, locale, key);
export const miscLabel = (locale: Locale, key: string) => pick(MISC, locale, key);
