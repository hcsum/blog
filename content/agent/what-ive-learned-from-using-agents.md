---
title: "我自己的 agent 配置：workspace 当家目录、headless runtime，以及记忆最后落在哪"
description: "从 NanoClaw 说起：把 agent-workspace 当成 agent 的家，用 opencode serve 把它从电脑里放出来，靠 notes / user.md / todos.md 分层管记忆，以及自动记忆试过的两条路和最后留下的那条。"
titleZh: "我自己的 agent 配置：workspace 当家目录、headless runtime，以及记忆最后落在哪"
titleEn: "My own agent setup: workspace as home directory, headless runtime, and where I landed on memory"
descriptionZh: "从 NanoClaw 说起：把 agent-workspace 当成 agent 的家，用 opencode serve 把它从电脑里放出来，靠 notes / user.md / todos.md 分层管记忆，以及自动记忆试过的两条路和最后留下的那条。"
descriptionEn: "Starting from NanoClaw: making agent-workspace the agent's home, taking it off my machine with opencode serve, layering memory across notes / user.md / todos.md, and the two automatic-memory approaches I tried before settling on one."
date: 2026-07-30
tags: ["Agent", "OpenCode", "Claude Code", "Memory", "Workflow"]
bilingual: true
defaultLang: "zh"
draft: false
---

<div data-lang="zh">

小龙虾火了之后我开始用 agent，但没真正用过小龙虾和 Hermes。第一个上手的是 [NanoClaw](https://github.com/nanocoai/nanoclaw/)，它的特色是代码量少、主要逻辑读得懂，我用起来安心些。后来弃用了，它的多通道和容器化对我没必要，只增加复杂度。

NanoClaw 跑在 claude-agent-sdk 上。然后我知道了 Claude Code 跟 Claude Desktop 也跑在同一套东西上。后来又知道 Codex 和 OpenCode 也各有自己的 agent SDK。各家细节不同，但负责的东西是同一批：

```text
Agent SDK
    ├── Session 管理
    ├── 模型调用
    ├── Agent Loop
    ├── 工具调用
    ├── 文件和 Shell
    ├── 权限审批
    ├── 流式事件
    └── 上下文管理
```

OpenClaw 和 Hermes 也是各自造了一个类似的东西。看明白这一层之后，我对「换一个 agent 客户端」这件事就没什么执念了：下面那层大同小异，区别在于外面那层怎么给你用。

## 一、从 TUI 开始

放弃 NanoClaw 之后我就直接用 Claude Code 和 OpenCode。一开始很朴素：在某个项目目录下敲 `claude` 或 `opencode`，起个 TUI 就开始干活。

然后我写了一些 skills，给它调用我这台电脑的能力：用我的浏览器、用 ffmpeg 剪视频、把 markdown 转成 PDF。到这一步它已经不只是个写代码的东西了。

## 二、把 agent 本身变成一个项目

接着是事后看最关键的一步：把 `AGENTS.md`、`CLAUDE.md`、`.opencode/`、`.claude/`、skills 全部收进一个固定的文件夹，我叫它 **agent-workspace**。从此我跑 `claude` 或 `opencode` 都在这个 workspace 里，不在某个具体项目里。

然后我在 workspace 里放了一个 `./notes` 文件夹。每轮对话中有需要的时候，就让它把东西写进去 —— 一次调研的结果、一次讨论的结论。

慢慢地我大部分工作都从这个 workspace 出发。哪怕要开发维护我自己的项目，我也是在这里说一句「去 `../xxx` 把什么什么做了」。

也是从这时候起，它不再是个写代码的工具了。见客户之前，它读完对方的流程文档和 Excel 表格，帮我判断我能在哪一环真正帮上忙；它用 ffmpeg 把一条口播视频剪短，还自己导出关键帧、看图检查剪得对不对；它翻了我几年的旧聊天记录，捞出值得做成东西的线索。这些都不是「进某个 repo 写代码」，而且如果 agent 的家是一个 repo，这些事一件也做不成。

工作目录从「项目」挪到了「我」。项目变成了它去访问的对象。

## 三、把 agent 从电脑里放出来

后来我知道 OpenCode 是 server/client 架构：本地跑 `opencode` 时除了 TUI，它同时会拉起一个 server，也就是一个 headless 的 agent runtime。这个 server 可以单独起，任何客户端都能连上去。

于是我在 workspace 上跑 `opencode serve`，把 [opencode-telegram-bot](https://github.com/grinev/opencode-telegram-bot) 指向那个 server，就能在手机上用 Telegram 控制我的 agent 了。session 是互通的：我在电脑前干到一半的活，离开电脑后可以在 Telegram 上接着干，反过来也一样。

一个是钢铁侠穿着战衣，一个是钢铁侠远程操控战衣。

## 四、笔记本

agent 变得随手就能用之后，我开始把想法和日程一股脑倒给它，看到有意思的东西也让它顺手收着。它全部存进 notes。

为了让它管好这个笔记本，我定了几条规则和几个 skill。比如我说「记下来 xxx」：

- 内容是给我以后看的 → `notes/brain-dump/`，逐字保存，不做摘要
- 内容是给 agent 看的跨 session 操作性事实 → `notes/memory/`

我说「总结一下这篇」，会触发 summarization skill，做一次真正的分析，而不是抽一个干巴巴的骨架提纲。

我也用了 Andrej Karpathy 那套 LLM wiki 的方法论：我说「ingest 某个链接」，它会读完，然后走一遍归纳总结的流程，落到 `notes/knowledge/` 里。

再后来我把 `notes` 挪进了一个 GitHub 私有库，作为独立的 repo checkout 在 workspace 里。Agent 每次改完笔记，就 commit。

## 五、`user.md` 和 `todos.md`

**`user.md`** 是 agent 对我的认识，我自己维护，不让它改。分几节：

- **goals** —— 几条我的大目标，一年内不太会变的那种
- **constraints** —— 我的真实处境，比如存款还能撑多久、一天到底能专注几小时。没有这一节，它给的每条建议都正确且没用
- **shortcomings** —— 我自己承认的毛病，例如思维分散不闭环
- **don't let me** —— 一张反清单，写清楚哪些行为是逃避、不能纵容，例如捣鼓某个样式捣鼓一小时，而不是去推广项目

**`todos.md`** 是我唯一的待办清单，由 agent 维护。每条带 `[优先级][主题]` 标签和 `added` / `touched` 日期，分 active / backlog / done。我口头说的进展它写进去，我问「昨天哪些没做完」它按日期块回答。

有了这两个文件，加上它实时知道我在干嘛，它就能干一件我觉得很不错的事：充当我的导师跟伙伴，在我做的事情跟我说过在乎的目标对不上时提醒我。也能给我管理待办 —— 我觉得自己有点 ADHD 倾向，脑子想法很多，经常开新线路，它能帮我抓主线。

后来我把这套东西泛化成了一个 Claude Code 插件发出去了：[dont-let-me](https://github.com/hcsum/dont-let-me)。

## 六、捣鼓自动记忆

笔记本主要是我让它写、它才写。我想让它不用我开口，自动把关于我的耐久事实存下来，下次自动用上。

我试过两个方案。

**文件式。** 抄 Claude Code 那套：一条事实一个 markdown，`MEMORY.md` 当索引，每个会话 eager 注入。好处是隐式召回天生就在，模型不用意识到「这儿可能有记忆」，它已经看见了。坏处是索引常驻上下文。还有记忆是靠 skill 触发的，记不记看 agent 心情。

**接 [mem0](https://github.com/mem0ai/mem0)。** 记忆触发放在 OpenCode 的钩子上，保证每轮 session 结束必然会记。但召回是 pull-based 的，agent 得先想到去调用 MCP 工具，才搜得到 —— 这个问题不大。让我放弃它的是 mem0 的记忆机制太激进，啥都记，有时还记串了上下文；记忆本来就容易过期或记错，而它进的是向量库，不好 audit。

现在跑的是文件式。自动捕捉不可靠，所以重要的我主动让它记，漏掉的去 session log 里 grep。

以后我打算模仿下小龙虾那套 dreaming，搞个独立进程去做记忆，这样上下文比较完整，记下来的东西也比较可控；还有 MemOS 那套给记忆打分、引入淘汰跟沉淀的机制。那就是后话了。

## 几条心得

**agent 的家应该是一个关于我的目录，而不是某个项目的 checkout。** 后面所有事情都是从这一步长出来的 —— 上下文、skills、记忆不再按项目分家，而是开始累积。

记忆按读者分层，不按重要性分层。我的、agent 的、外部世界的，三个文件夹三条规则。混在一起，三种都会烂掉。

headless runtime 是关键的一步。知道 `opencode serve` 给的是一个 server 之后，「在哪儿用 agent」和「怎么用 agent」就解耦了。TUI、聊天软件、定时任务，都只是同一个 runtime 的前端。

还有，让它盯着我的目标，比让它多写点代码值钱。写代码是所有人都在做的事，也是模型本来就擅长的事。真正属于我的那部分，是一个我自己写的、关于我的文件。

</div>

<div data-lang="en">

I started using agents after OpenClaw blew up, though I never really used OpenClaw or Hermes myself. The first one I actually ran was [NanoClaw](https://github.com/nanocoai/nanoclaw/) — a small codebase with the main logic readable end to end, which made me comfortable. I dropped it later; its multi-channel and containerization work wasn't necessary for me and only added complexity.

NanoClaw runs on claude-agent-sdk, and I learned that SDK also powers Claude Code and Claude Desktop. Later I learned Codex and OpenCode each have their own agent SDK too. The details differ, but they all own the same set of concerns:

```text
Agent SDK
    ├── session management
    ├── model calls
    ├── agent loop
    ├── tool calling
    ├── files and shell
    ├── permission approval
    ├── streaming events
    └── context management
```

OpenClaw and Hermes each built something similar. Once I understood that layer, I stopped being attached to any particular agent client — the layer underneath is roughly the same everywhere, and the difference is in how the layer on top hands it to you.

## 1. Starting from the TUI

After dropping NanoClaw I just used Claude Code and OpenCode directly: in some project directory, run `claude` or `opencode`, get a TUI, start working.

Then I wrote some skills to give it access to what my machine can do: use my browser, cut video with ffmpeg, turn markdown into PDF. At that point it was already more than a thing that writes code.

## 2. Making the agent itself a project

Then I did the thing that turned out to matter most. I moved `AGENTS.md`, `CLAUDE.md`, `.opencode/`, `.claude/` and all my skills into one fixed folder — I call it **agent-workspace**. From then on I run `claude` or `opencode` inside that workspace, not inside a specific project.

Then I put a `./notes` folder inside the workspace. Whenever something in a conversation was worth keeping, I had it write into that folder — the result of a round of web research, the conclusion of a discussion.

Gradually most of my work started from this workspace. Even when developing and maintaining other projects, I sit here and say "go to `../xxx` and do this and that."

Which is also when it stopped being a coding tool. It has read through a client's process docs and spreadsheets to work out where I could actually be useful before I went to meet him; it has cut a talking-head video down with ffmpeg and checked its own work by dumping stills and looking at them; it has gone through a few years of my old chat logs to pull out the threads worth making something out of. None of that is "go into a repo and write code," and none of it would work if the agent's home were a repo.

The working directory moved from "the project" to "me." Projects became things it visits.

## 3. Getting the agent out of my computer

Later I learned that OpenCode uses a server/client architecture: when you run `opencode` locally, it starts a server alongside the TUI — a headless agent runtime. You can spin that up alone and have any client connect to it.

So I run `opencode serve` on the workspace, point [opencode-telegram-bot](https://github.com/grinev/opencode-telegram-bot) at that server, and then I can control my agent from Telegram on my phone. The sessions are shared: work I'm halfway through at my desk, I can continue on Telegram after I leave the computer, and vice versa.

Iron Man in the suit, versus Iron Man flying the suit by remote.

## 4. The notebook

Now that it is easy to reach my agent, I started dumping my ideas and my agenda into it, and having it bookmark anything I find interesting. It saves everything in the notes.

To make it manage that notebook well, I set a few rules and a few skills. For example, when I say "mark this down / remember this / save this":

- content that's for me to read later → `notes/brain-dump/`, saved verbatim, no summarizing
- operational facts across sessions that are for the agent → `notes/memory/`

When I say "summarize this", it triggers the summarization skill and does a proper analysis instead of a shallow skeleton outline.

I also use Andrej Karpathy's LLM wiki methodology: I say "ingest this link," it reads the whole thing, runs a structured summarization pass, and files the result under `notes/knowledge/`.

Later still I moved `notes` into a private GitHub repo, checked out inside the workspace as a nested repo. Every time the agent edits the notes, it commits.

## 5. `user.md` and `todos.md`

**`user.md`** is the agent's picture of me. I maintain it and don't let it edit the file. A few sections:

- **goals** — a few north stars, the kind of goal that won't move much within a year
- **constraints** — actual circumstances, like how long my savings hold out and how many hours a day I can really focus. Without this section, every piece of advice it gives is correct and useless
- **shortcomings** — flaws I admit to myself
- **don't let me** — a list of anti-behaviors, spelling out which ones are avoidance and are not to be indulged

**`todos.md`** is the single todo surface, maintained by the agent. Each item carries a `[priority][theme]` tag and `added` / `touched` dates, split into active / backlog / done. Progress I mention out loud gets written in; when I ask "what didn't close yesterday," it answers from the dated blocks.

With those two files, plus the fact that it knows what I'm actually working on day to day, it can do something I find genuinely useful: act as a mentor and a companion, and tell me when what I'm doing doesn't serve the goals I said matter. It also keeps the list for me. I have some ADHD tendencies — plenty of ideas, always opening a new thread — and it helps me hold on to the main one.

Later I generalized this whole thing into a Claude Code plugin and published it: [dont-let-me](https://github.com/hcsum/dont-let-me).

## 6. Messing with automatic memory

The notebook mostly only writes when I tell it to. I wanted it to store durable facts about me on its own, without my asking, and use them automatically next time.

I tried two approaches.

**File-based.** Copying Claude Code's approach: one fact per markdown file, `MEMORY.md` as the index, eagerly injected into every session. The good part is that implicit recall comes for free — the model doesn't have to be aware that "there might be memory here," it's already looking at it. The downside is that the index sits in context permanently. Also, memory was triggered by a skill, so whether anything got written depended on the agent's mood.

**Wiring in [mem0](https://github.com/mem0ai/mem0).** I moved the memory trigger onto an OpenCode hook, which guaranteed something gets written at the end of every session. But recall is pull-based: the agent has to think of calling the MCP tool before it can search. That part wasn't a big deal. What made me drop it was that mem0's memory behavior is too aggressive — it stores everything, sometimes also out of context. Memory is easy to go stale or wrong, and since it goes into a vector store it's hard to audit.

What I run now is the file-based one. Automatic capture is unreliable, so I ask explicitly for the things that matter, and grep the session logs for the ones I forgot.

Later on I want to copy what OpenClaw does with dreaming — a separate process that handles memory, so the context is more complete and what gets stored is more controllable. And MemOS's approach of scoring memories, with mechanisms for decay and consolidation. That's for another day.

## Some takeaways

**The agent's home should be a directory about me, not a checkout of some project.** Everything else followed from that one move — context, skills and memory stop being per-project and start compounding.

Layer memory by reader, not by importance. Mine, the agent's, and the outside world's, in three folders with three rules. Mixed together, all three rot.

The headless runtime is the important step. Once you know `opencode serve` gives you a server, _where_ you use the agent decouples from _how_. TUI, chat apps, cron jobs are all just frontends on the same runtime.

And having it hold you to your own goals is worth more than having it write more code. Writing code is what everyone is already doing, and it's what the model is already good at. The part that's actually mine is a file about me that I wrote myself.

</div>
