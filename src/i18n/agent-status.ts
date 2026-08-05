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
    waiting: "Waiting on input",
    error: "Attention required",
    failed: "Attention required",
    idle: "Agent idle",
    offlinePresence: "Agent offline",
    stalePresence: "Heartbeat delayed",
    default: "Agent unavailable",
  },
  zh: {
    active: "活跃",
    deployment: "正在部署更新",
    received: "收到新任务",
    queued: "任务排队中",
    running: "Agent 运行中",
    researching: "调研中",
    drafting: "正在写回复",
    knowledge: "正在更新知识库",
    completed: "任务已完成",
    delivered: "报告已送达",
    waiting: "等待输入",
    error: "需要关注",
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
    waiting: "Waiting on a reply",
    error: "Task failed safely",
    failed: "Task failed safely",
    idle: "Agent idle",
    default: "Agent unavailable",
  },
  zh: {
    active: "Agent 活跃",
    offline: "Agent 离线",
    stale: "心跳延迟",
    deployment: "正在部署新版本",
    received: "收到新任务",
    queued: "任务排队中",
    running: "正在处理任务",
    researching: "正在调研这个请求",
    drafting: "正在写回复",
    knowledge: "正在更新知识库",
    completed: "任务已完成",
    delivered: "报告已送达",
    waiting: "在等一个回复",
    error: "任务已安全中止",
    failed: "任务已安全中止",
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
    waiting: "The agent paused and is waiting on a permission approval or a follow-up answer.",
    error:
      "The last task hit a recoverable error and stopped safely. Details are intentionally sanitized.",
    failed:
      "The last task hit a recoverable error and stopped safely. Details are intentionally sanitized.",
    idle: "No task is currently running. The agent is waiting for the next workload to enter its orbit.",
    default: "The agent status is currently unavailable.",
  },
  zh: {
    active: "Agent 正在处理任务。",
    offlinePresence: "本机现在没在发心跳，这里看到的任务状态可能已经不是当前的了。",
    stalePresence: "心跳晚了。Agent 可能还在跑，但这份公开快照未必是最新的。",
    offline: "本机当前连不上。这说明的是机器不在线，不是任务失败了。",
    stale: "最近一次心跳晚了，所以下面的任务状态可能已经过时。",
    deployment: "新版本正在发布。部署稳定之后 Agent 会回到任务上。",
    received: "刚进来一个新请求，正在准备执行。",
    queued: "有任务在排队，等一个空出来的 worker。",
    running: "Agent 正在执行任务。",
    researching: "Agent 在收集公开资料，收够了才动笔。",
    drafting: "材料够了，Agent 正在写回复。",
    knowledge: "Agent 正在更新自己的长期知识层。",
    completed: "上一个任务顺利结束，Agent 正在收尾。",
    delivered: "一份定时简报已经发出去了。",
    waiting: "Agent 停在等待里，要么在等一次授权确认，要么在等一个追问的回复。",
    error: "上一个任务碰到一个可恢复的错误，已经安全停下。细节做了脱敏处理。",
    failed: "上一个任务碰到一个可恢复的错误，已经安全停下。细节做了脱敏处理。",
    idle: "当前没有任务在跑，Agent 在等下一件事。",
    default: "当前取不到 Agent 状态。",
  },
};

/**
 * Event cards used to be headlined by `event.title`, which the bridge sets to
 * the channel name — so every Gmail-sourced event read "Gmail". The event type
 * is the part that actually differs, so it headlines the card and the channel
 * moves down into the chip row.
 */
const EVENT_TYPE: LocaleStatusMap = {
  en: {
    deployment: "Deployment",
    agent_idle: "Agent idle",
    task_received: "Task received",
    task_queued: "Task queued",
    task_started: "Task started",
    task_waiting: "Waiting on input",
    skill_loaded: "Skill loaded",
    research_started: "Research started",
    web_data_started: "Web data collected",
    draft_started: "Draft started",
    knowledge_update_started: "Knowledge updated",
    scheduled_report_started: "Scheduled report started",
    task_completed: "Task completed",
    task_failed: "Task failed",
    report_delivered: "Response delivered",
    default: "",
  },
  zh: {
    deployment: "部署",
    agent_idle: "Agent 空闲",
    task_received: "收到任务",
    task_queued: "任务排队",
    task_started: "任务开始",
    task_waiting: "等待输入",
    skill_loaded: "载入 skill",
    research_started: "开始调研",
    web_data_started: "抓取网页数据",
    draft_started: "开始起草",
    knowledge_update_started: "更新知识库",
    scheduled_report_started: "定时报告开始",
    task_completed: "任务完成",
    task_failed: "任务失败",
    report_delivered: "回复已送达",
    default: "",
  },
};

const PRESENCE: LocaleStatusMap = {
  en: { online: "Online", stale: "Stale", offline: "Offline", default: "Online" },
  zh: { online: "在线", stale: "延迟", offline: "离线", default: "在线" },
};

const MISC: LocaleStatusMap = {
  en: {
    waitingSnapshot: "Waiting for first snapshot",
    chipUnavailable: "Unavailable",
    default: "",
  },
  zh: {
    waitingSnapshot: "等第一份快照",
    chipUnavailable: "不可用",
    default: "",
  },
};

export const activityLabel = (locale: Locale, key: string) => pick(ACTIVITY, locale, key);
/** Returns undefined for statuses the dictionary doesn't cover, so callers can humanise instead. */
export const optionalActivityLabel = (locale: Locale, key: string) => ACTIVITY[locale]?.[key];
export const fallbackTitle = (locale: Locale, key: string) => pick(FALLBACK_TITLE, locale, key);
export const fallbackSummary = (locale: Locale, key: string) => pick(FALLBACK_SUMMARY, locale, key);
/** Returns undefined for event types the dictionary doesn't cover, so callers can humanise instead. */
export const optionalEventTypeLabel = (locale: Locale, key: string) => EVENT_TYPE[locale]?.[key];
export const presenceLabel = (locale: Locale, key: string) => pick(PRESENCE, locale, key);
export const miscLabel = (locale: Locale, key: string) => pick(MISC, locale, key);
