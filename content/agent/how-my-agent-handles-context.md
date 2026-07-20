---
title: "我的 personal agent 怎么管上下文：把 context 当易耗品，把记忆当资产"
description: "从一句 AGENTS.md 出发，讲我这个常驻个人 agent 是怎么分层管理记忆与上下文的：极小的常驻层 + 渐进式披露 + skill routing，让我可以放心地『做完就走、随手开新 session』。"
titleZh: "我的 personal agent 怎么管上下文：把 context 当易耗品，把记忆当资产"
titleEn: "How My Personal Agent Handles Context: Treat Context as Disposable, Memory as an Asset"
descriptionZh: "从一句 AGENTS.md 出发，讲我这个常驻个人 agent 是怎么分层管理记忆与上下文的：极小的常驻层 + 渐进式披露 + skill routing，让我可以放心地『做完就走、随手开新 session』。"
descriptionEn: "Starting from a single line in AGENTS.md, here's how my always-on personal agent layers memory and context: a tiny always-loaded core, progressive disclosure, and skill routing — so I can finish a task, close the session, and start a fresh one without a second thought."
ogImage: "/images/og/how-my-agent-handles-context.png"
ogImageAlt: "Abstract technical illustration of transient context windows flowing into durable organized memory blocks."
date: 2026-07-09
tags: ["Agent", "OpenCode", "Context", "Memory", "Progressive Disclosure"]
bilingual: true
defaultLang: "zh"
draft: false
---

<div data-lang="zh">

# 把 context 当易耗品，把记忆当资产

## 太长不读

我给自己跑了一个常驻的个人 agent。用久了我得出一个很朴素的原则：**上下文（context）是易耗品，记忆才是资产，这两件事要分开管。**

具体到操作上，就是一件反直觉的事——我**宁愿一个任务做完就关掉、随手开一个新 session，也不愿意在同一个长会话里一直待着。** 这篇讲我为什么这么做，以及为了让「做完就走」不丢失连续性，我在笔记结构和 prompt 上做了哪几层设计。

## 为什么宁愿开新 session

两个很实际的原因：

1. **贵——即便有缓存。** 我订阅不多（一个月 $40 左右）。有人会说现在 LLM 有 prompt caching，重读旧对话很便宜——没错，但缓存没法让长上下文变免费：缓存命中仍然按整段上下文的 token 计费，只是单价低；缓存还有很短的 TTL（几分钟级别），中间一停顿就得按原价重新灌一遍；而且上下文只增不减，每多一轮，被反复拖着走的那一整段就更大。缓存压低的是单价，压不掉「上下文越长，每一轮要处理的东西越多」这件事。
2. **会变笨。** 更关键的是，上下文越长，agent 反而越不聚焦，容易被前面无关的内容带偏。长上下文不是免费的记忆，它是一种会稀释注意力的负担。

所以我不把长会话当记忆用。任务做完，session 关掉；下一件事，开新的。

这句话听起来轻巧，但它有个前提：**如果记忆是存在对话里的，那关掉 session 就等于失忆。** 所以真正要解决的问题是——把记忆从「对话」里搬出来，放到一个关掉 session 也不会消失的地方。

## 记忆的落点：磁盘，不是对话

我的答案是一个独立的私有 git 仓库 `notes/`。它是这个 agent 记忆的**唯一真相来源（source of truth）**：todos、关于我的画像、operational facts、以及一整个知识 wiki，全都是磁盘上的 markdown，不在任何一次对话里。

选磁盘而不是对话、选显式 markdown 而不是向量库，还有一个我越来越看重的理由：**可审计（auditable）。** 记忆一旦以人能读的纯文本落盘，我随时能打开看它到底记了什么、哪条错了、什么时候被改的（git 全程留痕）。自动记忆最大的隐患从来不是「记不住」，而是它会稳定地记住一些低价值、半正确、又看不见的东西——出问题时你根本不知道 agent 此刻是被哪条脏记忆带偏的。对一个要长期替我做判断的 agent，「我能亲眼检查、随手修正它的记忆」这件事，比「记忆有多聪明」重要得多。

> 顺带一提：我之前还真的做过一整套「自动记忆」——文件式 memory、后来 mem0 + Qdrant 向量库。最后把它默认关掉了，回到「重要的东西显式写进 `notes/`」。这段完整的复盘我单独写过一篇：[《我为什么给 agent 加了 memory，最后又把它删了》](/posts/agent/building-memory-for-our-opencode-agent/)。这里只留一句结论：**让一个不透明的自动层做真相，不如让一个我能读能审计的 `notes/` 做真相。**

新 session 启动时，agent 不靠「记得上次说过什么」，而是**从磁盘重新水合（re-hydrate）**。这就把问题变成了：一个新开的、什么都不记得的 session，怎么在不把整个仓库塞进 context 的前提下，快速知道「它是谁、我是谁、现在该干嘛、需要时去哪查」。

这就是分层的意义。

## 一切从 `AGENTS.md` 的一句话开始

入口是仓库根目录的 `AGENTS.md`（我同时跑在 OpenCode 和 Claude Code 上，后者对应的是 `CLAUDE.md`，内容基本一致）。它是每个 session 都会加载的系统提示。里面有决定性的两行：

```markdown
## About the user

@notes/user.md
@notes/todos.md
```

这个 `@` 语法会把这两个文件的**全文内联进系统提示**。也就是说，无论我开多少个新 session，下面两样东西**永远常驻**在上下文里：

- `notes/user.md` —— 关于我的画像：北极星目标、现实约束、我的短板、以及一份「别让我做的事」清单。
- `notes/todos.md` —— 我全部的待办。

因为这个 agent 的定位是 personal assistant，「我是谁」和「我在追什么」是它做任何判断的地基，所以这两样值得付「每次都注入」的固定成本。

**除此之外，几乎所有东西都不是常驻的，而是「指针常驻、内容按需」。** 这就是渐进式披露（progressive disclosure）。

## 让结构自己描述自己：别让 prompt 里的路径过时

这里有个我踩过坑之后特别注意的点：**根 prompt 尽量不去硬编码 `notes/` 内部的目录结构。**

原因很简单——结构是会变的。如果我在 `AGENTS.md` 里把每一层的路径、每个子目录的用途都写死，那每次我调整笔记仓库的组织方式，就得回来改这份根 prompt。两边很快对不上，prompt 里的路径就开始腐烂（stale），而 agent 还在照着一份过时的地图找东西。

我的做法是：根 prompt 只做一件事——**指向那个笔记 repo**，然后把「这个 repo 内部到底怎么组织」这件事，交给 repo 自己。`notes/` 里放着它自己的一份 `AGENTS.md`（和对应的 `CLAUDE.md`），里面用一段 `## Layout` 逐层说明每个目录是干嘛的、谁维护、怎么改。**那份文档才是结构的 single source of truth**——它跟被它描述的结构住在一起，agent 真正进到 `notes/` 里干活时自然会读到它。

好处是：我要调整结构，只改那一个地方——改结构的同时就顺手改了它的说明，根 prompt 一个字都不用动，也就无从过时。这其实是同一个渐进式披露原则的延伸：**上层只持有「去哪找」，具体的、易变的细节留在离它最近的那一层，就地维护。**

## 第一层设计：分清「关于它的记忆」和「关于我的记忆」

一个 personal agent 会碰到各种各样要「记下来」的东西，但它们的归属完全不同。我把它们拆成了几个物理上分开的层，并在 `AGENTS.md` 里用一段 **routing 规则**告诉 agent 每类内容该去哪：

| 层                  | 是关于谁的                              | 谁维护             | 是否常驻 |
| ------------------- | --------------------------------------- | ------------------ | -------- |
| `notes/user.md`     | 关于**我**（画像/目标/短板）            | 我，agent 不可改   | ✅ 常驻  |
| `notes/memory/`     | **agent 自己**跨 session 要记的操作事实 | `remember` skill   | ❌ 按需  |
| `notes/brain-dump/` | 我想留存、以后自己回看的原文            | `brain-dump` skill | ❌ 按需  |
| `notes/knowledge/`  | **外部世界**的知识                      | `llm-wiki` skill   | ❌ 按需  |

`AGENTS.md` 里那段路由长这样（节选）：

```markdown
## Handling content

- brain-dump skill — 我想自己留存的原文 → notes/brain-dump/
- remember skill — agent 自己需要跨 session 的操作context → notes/memory/
- llm-wiki skill — 外部/世界知识，ingest 和 query
```

这层区分的意义在于：**「关于我的事实」和「agent 自己要记的操作细节」是两种东西。** 前者是我维护的、稳定的身份（比如我的目标），agent 只读；后者是 agent 在协作中攒下来的、给它自己用的备忘（比如「登录那台树莓派的 SSH 命令」「某个数据源覆盖哪几个月」），一条一个 topic 文件，`remember` skill 负责写。

`notes/memory/` 尤其能体现「易耗品 vs 资产」这个主线——它**不自动注入**任何 session。常驻的只有一张 `index.md` 表（每个 topic 一行摘要），agent 判断当前任务跟某条相关时，才顺着 index 去读那一个文件。记忆库可以无限增长，却不会撑大每一次对话。

## 第二层设计：笔记格式是为我一个人定制的

分层解决了「东西放哪」，但要让一个冷启动的 session 一眼看懂这些文件，格式必须是**结构化且高度个人化**的，而不是随手记。

`todos.md` 是最典型的例子。它不是一个平铺的清单，而是有固定语法的：

```markdown
## active

- [P0][job] 准备后端岗位面试 · added 07-07 · touched 07-07
  - 参考 JD：notes/brain-dump/flexport-...md
  - 明天起按这个方向持续准备：分布式系统、system design、行为面
```

- `[P0]`–`[P3]` 是优先级，`[job]`/`[seo]`/`[agent]` 是主题标签；
- `added` / `touched` 两个日期让「一件事多久没动了」变得可测量；
- 三段状态 `active` / `backlog` / `done`。

这套格式不是通用模板，是**冲着我的毛病设计的**。`user.md` 里明确写着我的短板（容易开新坑不闭环、ADHD 式地钻配置牛角尖）和一份 `## don't let me` 清单。于是 `todos.md` 的 `touched` 日期、以及独立的 `mentor` skill，就能让 agent 在合适的时机指出「X 这周动了两次，Y 三周没碰」——把我自己容易忽略的漂移量化出来。

换句话说：**笔记格式本身就是 personalization 的载体。** 同样一份 todo 列表，为别人设计会长成完全不同的样子。

## 第三层设计：知识 wiki——层里还有层

外部知识那一层（`notes/knowledge/`，由 `llm-wiki` skill 管）本身又是一个完整的分层系统，很能说明「分层」这个思路可以递归下去：

- `raw/` —— **证据层**。原始来源，只进不改，保留高保真原文。
- `wiki/` —— **维护层**。agent 提炼出来的结构化页面，还按类型再分：`sources/` / `entities/` / `concepts/` / `syntheses/` / `reports/`。
- `schema/` —— **操作手册**。这一层甚至有它自己的一份 `AGENTS.md`，专门规定 ingest / query / lint 的规则。

也就是说，`knowledge/` 是一个**带有嵌套 prompt 的子系统**：主 `AGENTS.md` 只需要知道「世界知识 → 走 `llm-wiki` skill」，而这个子系统内部怎么组织、遵守什么规则，被封装在它自己的 schema 里，只有当 agent 真的进来做 ingest 时才需要展开。这正是渐进式披露在结构上的体现——**上层只持有一个入口，细节留在下层，用到才加载。**

## 把这几层串起来：靠 skill routing

到这里，常驻上下文里其实只有三样东西：`AGENTS.md` 本身、`user.md`、`todos.md`。剩下的全靠**渐进式披露 + skill routing** 按需展开：

- 我这套装了 ~28 个 skill（`brain-dump`、`remember`、`llm-wiki`、`mentor`、`research`、`x-search`……）。但**常驻进上下文的，只有每个 skill 一行 `description`**。skill 的完整正文（步骤、脚本、注意事项）只有在它被触发时才加载。
- 同理，`memory/` 只常驻一张 index，`knowledge/` 只常驻一个入口概念，portfolio 在 `user.md` 里只有一行指针——真正的内容全都是「等你需要时我再去读」。

这里的关键机制就是 **routing**：`AGENTS.md` 和每个 skill 的 `description` 共同构成一张「什么情况该展开什么」的路由表。系统提示不需要包含所有知识，它只需要包含**足够的信号，知道去哪里找**。哪一层被激活，取决于我这一句话触发了哪条路由——这既是省 token 的手段，也是让 agent 保持聚焦的手段。

## 收束

回到开头那句：

> 上下文是易耗品，记忆是资产。

长会话的诱惑，本质上是在**拿易耗的 context 当持久的记忆用**——短期方便，长期又贵又让 agent 变钝。我的整套做法就是把这两者彻底分开：

- 记忆（资产）放磁盘，结构化、分层、个人化；
- 上下文（易耗品）保持精简，一个极小的常驻层打底，其余靠 skill routing 渐进式展开；
- 于是「做完就走、随手开新 session」变成一件没有心理负担的事——因为下一个 session 关心的一切，都在磁盘上等着被重新水合。

这只是我目前的写法，不是标准答案。但「把 context 和 memory 当成两种东西来管」这个判断，我觉得会一直成立。

</div>

<div data-lang="en">

# Treat Context as Disposable, Memory as an Asset

## TL;DR

I run an always-on personal agent for myself. After using it for a while, I've settled on a pretty plain principle: **context is disposable, memory is the asset, and the two should be managed separately.**

In practice, that leads to something counterintuitive: **I'd rather finish a task, close the session, and spin up a fresh one than stay parked in the same long conversation.** This post is about why I do that, and what layers of note structure and prompting I built so that "finish and leave" doesn't cost me continuity.

## Why I'd Rather Start a New Session

Two very practical reasons:

1. **It's expensive — even with caching.** I don't spend much on subscriptions (around $40 a month). Someone will point out that modern LLMs have prompt caching, so re-reading old conversations is cheap — true, but caching doesn't make a long context free. A cache hit still bills you for the tokens of the entire context, just at a lower unit price. The cache also has a short TTL (on the order of minutes), so any pause means re-feeding the whole thing at full price. And context only ever grows — every extra turn makes the block you keep dragging along even bigger. Caching lowers the unit price; it doesn't remove the fact that "the longer the context, the more there is to chew through on every turn."
2. **It gets dumber.** More importantly, the longer the context, the less focused the agent becomes, and the more easily it gets pulled off track by irrelevant earlier content. A long context is not free memory — it's a burden that dilutes attention.

So I don't use a long session as memory. Task done, session closed; next thing, new session.

That sounds glib, but it has a precondition: **if memory lives inside the conversation, then closing the session is amnesia.** So the real problem to solve is moving memory out of the conversation and into somewhere that survives a closed session.

## Where Memory Lands: Disk, Not the Conversation

My answer is a separate private git repo, `notes/`. It's the **single source of truth** for this agent's memory: todos, my profile, operational facts, and an entire knowledge wiki — all markdown on disk, none of it inside any one conversation.

There's another reason I increasingly value for choosing disk over conversation, and explicit markdown over a vector store: **it's auditable.** Once memory lands on disk as human-readable plain text, I can open it any time and see exactly what it recorded, which entry is wrong, and when it changed (git keeps the full trail). The biggest hazard of automatic memory was never "failing to remember" — it's that it reliably remembers low-value, half-correct, and invisible things, and when something goes wrong you have no idea which dirty memory just pulled the agent off course. For an agent that makes judgment calls on my behalf over the long term, "I can inspect and correct its memory with my own eyes" matters far more than "how clever the memory is."

> As an aside: I actually did build a whole automatic-memory system once — first file-based memory, then a mem0 + Qdrant vector store. In the end I turned it off by default and went back to "write the important stuff explicitly into `notes/`." I wrote a separate postmortem on that whole arc: [Why I Added Memory to My Agent and Then Removed It](/posts/agent/building-memory-for-our-opencode-agent/). The one-line takeaway: **better to let a `notes/` I can read and audit be the source of truth than an opaque automatic layer.**

When a new session starts, the agent doesn't rely on "remembering what was said last time" — it **re-hydrates from disk**. That turns the problem into: how does a freshly opened session that remembers nothing quickly learn "who it is, who I am, what to do now, and where to look when it needs to" — without stuffing the whole repo into context?

That's what the layering is for.

## It All Starts With One Line in `AGENTS.md`

The entry point is `AGENTS.md` at the repo root (I run on both OpenCode and Claude Code; the latter reads `CLAUDE.md`, with essentially the same content). It's the system prompt loaded into every session. Two decisive lines live in it:

```markdown
## About the user

@notes/user.md
@notes/todos.md
```

This `@` syntax **inlines the full text** of these two files into the system prompt. Which means, no matter how many new sessions I open, the following two things are **always resident** in context:

- `notes/user.md` — my profile: north-star goals, real-world constraints, my shortcomings, and a "don't let me do this" list.
- `notes/todos.md` — all of my todos.

Because this agent is positioned as a personal assistant, "who I am" and "what I'm chasing" are the bedrock for any judgment it makes — so these two are worth paying the fixed cost of "inject every time."

**Beyond that, almost nothing is resident; instead, the pointer is resident and the content is on-demand.** This is progressive disclosure.

## Let the Structure Describe Itself: Don't Let Paths in the Prompt Go Stale

Here's a point I got very careful about after getting burned: **the root prompt should avoid hardcoding the directory structure inside `notes/`.**

The reason is simple — structure changes. If I write every layer's path and every subdirectory's purpose into `AGENTS.md`, then every time I reorganize the notes repo I have to come back and edit that root prompt. The two drift apart fast, the paths in the prompt start to rot (go stale), and the agent keeps hunting for things using an outdated map.

My approach: the root prompt does exactly one thing — **point at the notes repo** — and then hands "how this repo is actually organized" to the repo itself. `notes/` carries its own `AGENTS.md` (and matching `CLAUDE.md`), which uses a `## Layout` section to explain layer by layer what each directory is for, who maintains it, and how to change it. **That document is the single source of truth for the structure** — it lives alongside the structure it describes, and the agent naturally reads it when it actually goes into `notes/` to work.

The payoff: to reorganize the structure, I only edit that one place — and editing the structure updates its description in the same breath. The root prompt doesn't change a single character, so it can't go stale. This is really an extension of the same progressive-disclosure principle: **the upper layer holds only "where to look," and the concrete, volatile details stay in the layer closest to them, maintained in place.**

## Layer One: Separate "Memory About the Agent" From "Memory About Me"

A personal agent runs into all sorts of things worth "writing down," but they belong in completely different places. I split them into physically separate layers, and use a **routing rule** in `AGENTS.md` to tell the agent where each kind of content goes:

| Layer               | Who it's about                               | Who maintains it   | Resident? |
| ------------------- | -------------------------------------------- | ------------------ | --------- |
| `notes/user.md`     | About **me** (profile / goals / weaknesses)  | Me, agent can't edit | ✅ Resident |
| `notes/memory/`     | Operational facts **the agent itself** needs across sessions | `remember` skill | ❌ On-demand |
| `notes/brain-dump/` | Verbatim content I want to keep and reread later | `brain-dump` skill | ❌ On-demand |
| `notes/knowledge/`  | Knowledge about the **outside world**        | `llm-wiki` skill   | ❌ On-demand |

The routing section in `AGENTS.md` looks like this (excerpt):

```markdown
## Handling content

- brain-dump skill — verbatim content I want to keep for myself → notes/brain-dump/
- remember skill — operational context the agent itself needs across sessions → notes/memory/
- llm-wiki skill — external / world knowledge, ingest and query
```

The point of this split: **"facts about me" and "operational details the agent needs for itself" are two different things.** The former is my maintained, stable identity (like my goals), and the agent only reads it; the latter is the agent's own scratch memory accumulated during collaboration (like "the SSH command to log into that Raspberry Pi" or "which months a given data source covers") — one topic file each, written by the `remember` skill.

`notes/memory/` best embodies the "disposable vs. asset" theme — it is **not auto-injected** into any session. The only resident piece is an `index.md` table (a one-line summary per topic); the agent only follows the index to read a specific file once it judges the current task to be related. The memory store can grow without bound, yet it never bloats any individual conversation.

## Layer Two: The Note Format Is Tailored to an Audience of One

Layering solves "where things go," but for a cold-started session to grok these files at a glance, the format has to be **structured and highly personal**, not jotted down ad hoc.

`todos.md` is the clearest example. It's not a flat list — it has a fixed syntax:

```markdown
## active

- [P0][job] Prep for backend interviews · added 07-07 · touched 07-07
  - reference JD: notes/brain-dump/flexport-...md
  - starting tomorrow, keep prepping this direction: distributed systems, system design, behavioral
```

- `[P0]`–`[P3]` is priority, `[job]`/`[seo]`/`[agent]` are theme tags;
- the two dates `added` / `touched` make "how long has this sat untouched" measurable;
- three status buckets: `active` / `backlog` / `done`.

This format is not a generic template — it's **designed against my specific flaws**. `user.md` spells out my shortcomings (a tendency to open new threads without closing them, ADHD-style rabbit-holing on config) and a `## don't let me` list. So the `touched` dates in `todos.md`, plus a dedicated `mentor` skill, let the agent point out at the right moment that "X moved twice this week, Y hasn't been touched in three weeks" — quantifying the drift I tend to overlook in myself.

In other words: **the note format is itself the vehicle for personalization.** The same todo list, designed for someone else, would grow into something completely different.

## Layer Three: The Knowledge Wiki — Layers Within Layers

The external-knowledge layer (`notes/knowledge/`, managed by the `llm-wiki` skill) is itself a complete layered system, which shows how the "layering" idea can recurse:

- `raw/` — the **evidence layer**. Original sources, append-only, kept at high fidelity.
- `wiki/` — the **maintained layer**. Structured pages the agent distills, further split by type: `sources/` / `entities/` / `concepts/` / `syntheses/` / `reports/`.
- `schema/` — the **operating manual**. This layer even has its own `AGENTS.md`, dedicated to the rules for ingest / query / lint.

In other words, `knowledge/` is a **subsystem with a nested prompt**: the main `AGENTS.md` only needs to know "world knowledge → go through the `llm-wiki` skill," while how this subsystem is organized internally and what rules it follows is encapsulated in its own schema, expanded only when the agent actually comes in to do an ingest. This is exactly progressive disclosure expressed structurally — **the upper layer holds only an entry point, the details stay in the lower layer, loaded only when used.**

## Stringing the Layers Together: Skill Routing

At this point, the resident context really only holds three things: `AGENTS.md` itself, `user.md`, and `todos.md`. Everything else is expanded on demand through **progressive disclosure + skill routing**:

- My setup has ~28 skills (`brain-dump`, `remember`, `llm-wiki`, `mentor`, `research`, `x-search`…). But **the only thing resident in context is a one-line `description` per skill**. A skill's full body (steps, scripts, caveats) loads only when it's triggered.
- Likewise, `memory/` keeps only an index resident, `knowledge/` keeps only an entry concept, and the portfolio is just a one-line pointer inside `user.md` — the actual content is all "I'll go read it when you need it."

The key mechanism here is **routing**: `AGENTS.md` and each skill's `description` together form a routing table of "what to expand under what conditions." The system prompt doesn't need to contain all the knowledge — it only needs to contain **enough signal to know where to look**. Which layer gets activated depends on which route my sentence triggered — this is both a way to save tokens and a way to keep the agent focused.

## Wrapping Up

Back to the line at the top:

> Context is disposable, memory is the asset.

The temptation of a long session is essentially **using disposable context as durable memory** — convenient in the short term, expensive and dulling for the agent in the long term. My whole approach is to fully separate the two:

- memory (the asset) lives on disk — structured, layered, personalized;
- context (the disposable) stays lean — a tiny resident core as the base, everything else expanded progressively via skill routing;
- so "finish and leave, spin up a new session on a whim" becomes a psychologically weightless act — because everything the next session cares about is waiting on disk to be re-hydrated.

This is just how I do it right now, not the definitive answer. But the judgment that "context and memory are two different things to manage" — I suspect that one holds up for good.

</div>
