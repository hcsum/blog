import type { Locale } from "@/i18n/config";

export const ui = {
  en: {
    "site.title": "Haochen Xu | Writing, experiments, and web craft",
    "site.description":
      "Personal site of Haochen Xu, with writing about software, engineering notes, and frontend experiments.",
    "site.name": "Haochen Xu",

    "nav.posts": "Posts",
    "nav.lab": "Lab",
    "nav.language": "Language",
    "nav.switchTo": "中文",

    "footer.tagline": "Writing, experiments, and ongoing work.",

    "home.title": "Haochen Xu",
    "home.description":
      "Personal site of Haochen Xu: full-stack software engineer writing about software, interfaces, and experiments on the web.",
    "home.eyebrow": "Hello World",
    "home.heading": "I'm Haochen",
    "home.intro1":
      "I build full-stack products with TypeScript, moving between product ideas, backend systems, data models, and frontend interfaces.",
    "home.intro2":
      "I'm especially interested in async architecture on the backend, and lately I've also been exploring AI agents and agent memory systems. I have a soft spot for UI that feels lively, clear, and easy to use.",
    "home.cta": "Read the posts",
    "home.experience": "Experience",
    "home.recentEyebrow": "Recent Writing",
    "home.recentHeading": "Latest notes and experiments",
    "home.browseArchive": "Browse archive",
    "home.present": "present",

    "posts.title": "Posts | Haochen Xu",
    "posts.description": "Essays, dev notes, data structures, and experiments.",
    "posts.eyebrow": "Archive",
    "posts.heading": "Writing on software, frontend craft, and things I want to understand better.",
    "posts.intro":
      "This is where I keep my notes, experiments, and longer write-ups. Some posts come from work, some from side projects, and some from going deep on a topic until it finally makes sense.",
    "posts.count": "posts",
    "posts.back": "Back to posts",
    "posts.readingTime": "min read",
    "posts.onThisPage": "On this page",
    "posts.noTranslation":
      "This post has no Chinese version yet — showing the English original.",

    "lab.title": "Lab | Haochen Xu",
    "lab.description":
      "A small lab of interactive frontend experiments — WebGL scenes, CSS tricks, and other browser-only toys.",
    "lab.eyebrow": "Lab",
    "lab.heading": "Small things I build for fun.",
    "lab.intro":
      "A growing shelf of interactive frontend experiments — WebGL scenes, CSS tricks, and other browser-only toys. Pick one and poke at it.",
    "lab.prev": "Previous",
    "lab.next": "Next",

    "lab.pretext.title": "Gravity todo list",
    "lab.pretext.description":
      "A small @chenglou/pretext experiment: every todo is measured as real multiline text, so checking one off breaks it into letters that drop and pile up below. Undo lifts them back into place.",
    "lab.planet.title": "A tiny low-poly planet",
    "lab.planet.description":
      "A procedural mini-world — an icosphere pushed into hills, a shell of water, cone-trees and drifting clouds, all generated in code. Drag to orbit; it turns on its own.",
    "lab.tilt.title": "Pointer-driven 3D tilt",
    "lab.tilt.description":
      "A no-dependency DOM trick: perspective transforms follow the cursor while a specular glare tracks it across the surface.",

    "lab.demo.gravityTodo": "Gravity todo",
    "lab.demo.undo": "Undo",
    "lab.demo.reset": "Reset",
    "lab.demo.allDone": "All done — nothing left to do.",
    "lab.demo.markDone": "Mark \"{todo}\" done",
    "lab.demo.todo1": "Ship the thing",
    "lab.demo.todo2": "Read the article I've had open in a tab since last month",
    "lab.demo.todo3": "Reply to the email I keep dodging",

    "agent.title": "Agent Status | Haochen Xu",
    "agent.description":
      "A public status panel backed by the agent's Workers status surface, showing current state and recent activity.",
    "agent.intro":
      "This page reads from the public status surface for my AI agent. I interact with it through a Gmail bridge, and the live card below is mirrored from a public Workers endpoint rather than the local machine itself. It also runs scheduled tasks like sending me morning reports with updates from my favorite websites. The event stream is only a recent public window into that activity.",
    "agent.repoLink": "View the repo on GitHub",
    "agent.feedNotice": "Live feed content comes from the agent and is published in English.",
    "agent.loading": "Loading agent status",

    "agent.stat.presence": "Presence",
    "agent.stat.lastHeartbeat": "Last heartbeat",
    "agent.stat.tasksHandled": "Tasks handled",
    "agent.stat.completedFailed": "Completed / Failed",
    "agent.stat.waiting": "Waiting",

    "agent.chip.status": "Agent Status",
    "agent.chip.lastKnown": "Last known",
    "agent.unavailable.title": "Agent unavailable",
    "agent.unavailable.summary":
      "The current status snapshot could not be fetched. Try again once the public status surface is reachable.",

    "agent.timeline.heading": "Recent activity",
    "agent.timeline.eyebrow": "Event Stream",
    "agent.timeline.empty": "No recent activity yet. The timeline fills in as new public events arrive.",
    "agent.timeline.stale":
      "Heartbeat is delayed. This timeline is only a recent public window and may already be behind the live machine.",
    "agent.timeline.offline":
      "The local agent is offline. This timeline remains available as a recent window, not a cumulative history.",
    "agent.timeline.fetching":
      "Recent activity is waiting on a fresh fetch. Showing the latest cached public window for now.",

    "agent.status.offline": "Agent offline",
    "agent.status.stale": "Heartbeat delayed",
    "agent.status.deploying": "Deploying update",
    "agent.status.received": "Task received",
    "agent.status.queued": "Task queued",
    "agent.status.running": "Agent running",
    "agent.status.researching": "Researching",
    "agent.status.drafting": "Drafting response",
    "agent.status.knowledge": "Updating knowledge",
    "agent.status.completed": "Task completed",
    "agent.status.delivered": "Report delivered",
    "agent.status.failed": "Attention required",
    "agent.status.idle": "Agent idle",
    "agent.status.unknown": "Agent unavailable",

    "agent.presence.online": "Online",
    "agent.presence.stale": "Stale",
    "agent.presence.offline": "Offline",

    "agent.header.unavailable": "AGENT UNAVAILABLE",
    "agent.header.offline": "AGENT OFFLINE",
    "agent.header.stale": "AGENT STALE",
    "agent.header.idle": "AGENT IDLE",
    "agent.header.researching": "AGENT RESEARCHING",
    "agent.header.responding": "AGENT RESPONDING",
    "agent.header.learning": "AGENT LEARNING",
    "agent.header.updating": "AGENT UPDATING",
    "agent.header.degraded": "AGENT DEGRADED",
    "agent.header.active": "AGENT ACTIVE",
    "agent.header.feed": "Public status feed",

    "rss.title": "Haochen Xu",
    "rss.description":
      "Writing about web engineering, frontend experiments, and whatever is worth understanding deeply.",
  },

  zh: {
    "site.title": "Haochen Xu | 写作、实验与网页手艺",
    "site.description": "Haochen Xu 的个人网站：关于软件的写作、工程笔记，以及前端实验。",
    "site.name": "Haochen Xu",

    "nav.posts": "文章",
    "nav.lab": "实验室",
    "nav.language": "语言",
    "nav.switchTo": "EN",

    "footer.tagline": "写作、实验，以及正在做的事。",

    "home.title": "Haochen Xu",
    "home.description":
      "Haochen Xu 的个人网站：全栈软件工程师，写软件、界面，以及网页上的各种实验。",
    "home.eyebrow": "Hello World",
    "home.heading": "我是 Haochen",
    "home.intro1":
      "我用 TypeScript 做全栈产品，在产品想法、后端系统、数据模型和前端界面之间来回切换。",
    "home.intro2":
      "我对后端的异步架构特别感兴趣，最近也在折腾 AI agent 和 agent 的记忆系统。我偏爱那种有生气、清楚、好上手的界面。",
    "home.cta": "去看文章",
    "home.experience": "工作经历",
    "home.recentEyebrow": "最近写的",
    "home.recentHeading": "最新的笔记与实验",
    "home.browseArchive": "浏览全部",
    "home.present": "至今",

    "posts.title": "文章 | Haochen Xu",
    "posts.description": "随笔、开发笔记、数据结构，以及各种实验。",
    "posts.eyebrow": "归档",
    "posts.heading": "关于软件、前端手艺，以及我想弄明白的那些事。",
    "posts.intro":
      "这里放我的笔记、实验和长文。有些来自工作，有些来自 side project，还有些来自把一个话题一直钻到它终于说得通为止。",
    "posts.count": "篇",
    "posts.back": "返回文章列表",
    "posts.readingTime": "分钟阅读",
    "posts.onThisPage": "本页目录",
    "posts.noTranslation": "这篇还没有中文版，下面是英文原文。",

    "lab.title": "实验室 | Haochen Xu",
    "lab.description": "一个小小的前端实验室 —— WebGL 场景、CSS 小把戏，以及只跑在浏览器里的玩具。",
    "lab.eyebrow": "实验室",
    "lab.heading": "我为了好玩做的小东西。",
    "lab.intro":
      "一个不断长大的前端实验架子 —— WebGL 场景、CSS 小把戏，以及只跑在浏览器里的玩具。挑一个，动手玩玩。",
    "lab.prev": "上一页",
    "lab.next": "下一页",

    "lab.pretext.title": "有重力的待办清单",
    "lab.pretext.description":
      "一个 @chenglou/pretext 的小实验：每条待办都按真实的多行文本来度量，所以勾掉一条时它会碎成字母掉下去，堆在下面。撤销会把它们重新捡回原位。",
    "lab.planet.title": "一颗低多边形小星球",
    "lab.planet.description":
      "一个程序生成的小世界 —— 一颗被推挤出丘陵的 icosphere、一层水壳、圆锥树和飘着的云，全部由代码生成。拖动可以环绕观察，它自己也会转。",
    "lab.tilt.title": "跟着指针的 3D 倾斜",
    "lab.tilt.description":
      "一个零依赖的 DOM 小把戏：透视变换跟着光标走，同时一道高光在表面上追着它移动。",

    "lab.demo.gravityTodo": "重力待办",
    "lab.demo.undo": "撤销",
    "lab.demo.reset": "重置",
    "lab.demo.allDone": "都做完了 —— 没有剩下的了。",
    "lab.demo.markDone": "把「{todo}」标记为完成",
    "lab.demo.todo1": "把东西发出去",
    "lab.demo.todo2": "读那篇从上个月起就一直开着标签页的文章",
    "lab.demo.todo3": "回那封我一直在躲的邮件",

    "agent.title": "Agent 状态 | Haochen Xu",
    "agent.description": "一个公开的状态面板，数据来自 agent 的 Workers 状态接口，展示当前状态和近期活动。",
    "agent.intro":
      "这个页面读取我那个 AI agent 的公开状态接口。我通过 Gmail bridge 跟它交互，下面这张实时卡片镜像自一个公开的 Workers endpoint，而不是本机本身。它还会跑定时任务，比如把我常看的几个网站的更新做成早报发给我。下面的事件流只是这些活动的一个近期公开窗口。",
    "agent.repoLink": "在 GitHub 上查看仓库",
    "agent.feedNotice": "实时事件流的内容由 agent 产生，以英文发布。",
    "agent.loading": "正在加载 agent 状态",

    "agent.stat.presence": "在线状态",
    "agent.stat.lastHeartbeat": "最近心跳",
    "agent.stat.tasksHandled": "处理任务数",
    "agent.stat.completedFailed": "完成 / 失败",
    "agent.stat.waiting": "等待中",

    "agent.chip.status": "Agent 状态",
    "agent.chip.lastKnown": "最后已知状态",
    "agent.unavailable.title": "Agent 不可用",
    "agent.unavailable.summary": "拿不到当前的状态快照。等公开状态接口恢复可达之后再试。",

    "agent.timeline.heading": "近期活动",
    "agent.timeline.eyebrow": "事件流",
    "agent.timeline.empty": "暂时还没有近期活动。有新的公开事件进来时，这条时间线会自己填上。",
    "agent.timeline.stale": "心跳延迟。这条时间线只是一个近期的公开窗口，可能已经落后于实际运行的机器。",
    "agent.timeline.offline": "本地 agent 已离线。这条时间线仍然是一个近期窗口，不是完整历史。",
    "agent.timeline.fetching": "近期活动正在等待新一次拉取，先显示最近缓存的公开窗口。",

    "agent.status.offline": "Agent 离线",
    "agent.status.stale": "心跳延迟",
    "agent.status.deploying": "正在部署更新",
    "agent.status.received": "已接收任务",
    "agent.status.queued": "任务排队中",
    "agent.status.running": "Agent 运行中",
    "agent.status.researching": "调研中",
    "agent.status.drafting": "正在起草回复",
    "agent.status.knowledge": "正在更新知识库",
    "agent.status.completed": "任务已完成",
    "agent.status.delivered": "报告已送达",
    "agent.status.failed": "需要关注",
    "agent.status.idle": "Agent 空闲",
    "agent.status.unknown": "Agent 不可用",

    "agent.presence.online": "在线",
    "agent.presence.stale": "陈旧",
    "agent.presence.offline": "离线",

    "agent.header.unavailable": "AGENT 不可用",
    "agent.header.offline": "AGENT 离线",
    "agent.header.stale": "AGENT 陈旧",
    "agent.header.idle": "AGENT 空闲",
    "agent.header.researching": "AGENT 调研中",
    "agent.header.responding": "AGENT 回复中",
    "agent.header.learning": "AGENT 学习中",
    "agent.header.updating": "AGENT 更新中",
    "agent.header.degraded": "AGENT 降级",
    "agent.header.active": "AGENT 活跃",
    "agent.header.feed": "公开状态源",

    "rss.title": "Haochen Xu",
    "rss.description": "关于 Web 工程、前端实验，以及任何值得深入理解的东西。",
  },
} as const;

export type UIKey = keyof (typeof ui)["en"];

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return (ui[locale] as Record<string, string>)[key] ?? ui.en[key];
  };
}
