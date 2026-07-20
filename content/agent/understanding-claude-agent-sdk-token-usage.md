---
title: "几个 Claude Agent SDK 回合为什么会用完 5-hour limit"
description: "从一个 Gmail Bridge 触发的 Claude Code SDK session 出发，拆解为什么表面只有几轮对话，底层却产生了 44 次 model calls、5.84M cumulative usage tokens，以及 prompt caching、tool-use round trips 和 Claude Code harness 在里面分别做了什么。"
titleZh: "几个 Claude Agent SDK 回合为什么会用完 5-hour limit"
titleEn: "Why a Few Claude Agent SDK Turns Used Up My 5-Hour Limit"
descriptionZh: "从一个 Gmail Bridge 触发的 Claude Code SDK session 出发，拆解为什么表面只有几轮对话，底层却产生了 44 次 model calls、5.84M cumulative usage tokens，以及 prompt caching、tool-use round trips 和 Claude Code harness 在里面分别做了什么。"
descriptionEn: "Starting from a Gmail Bridge triggered Claude Code SDK session, this note breaks down how a few visible turns produced 44 model calls, 5.84M cumulative usage tokens, and a depleted 5-hour limit."
ogImage: "/images/og/claude-agent-sdk-token-usage.png"
ogImageAlt: "Abstract technical illustration of token streams, model-call traces, cache blocks, and a time-limit gauge."
date: 2026-07-20
tags: ["Agent", "Claude Code", "Claude Agent SDK", "Context", "Prompt Caching"]
bilingual: true
defaultLang: "zh"
draft: false
---

<div data-lang="zh">

# 几个 Claude Agent SDK 回合为什么会用完 5-hour limit

## 起因

我在用 Gmail Bridge 跟 agent 对话时，会直接给它发邮件或转发资料；后台由 Claude Agent SDK 调起 Claude Code，读 notes、查资料、调用工具，然后把结果回给我。

这次我通过 Gmail 跟它来回了几个回合之后，Claude 的 5-hour limit 被用完了。表面上只是几封邮件来回，直觉上不该这么快触顶，所以我去翻 `~/.claude` 里的 session log，看底层到底发生了多少次模型调用、每次 usage 长什么样。

最重的那个 Claude Code SDK 会话是：

```text
sessionId: 6b42cea1-5c21-41ac-87c6-170780d3ea6e
path: ~/.claude/projects/-Users-sum-Codes-opencode-agent/6b42cea1-5c21-41ac-87c6-170780d3ea6e.jsonl
entrypoint: sdk-ts
model: claude-opus-4-8
created: 2026-07-20 11:58:48 Asia/Shanghai
updated: 2026-07-20 14:57:15 Asia/Shanghai
```

把 assistant messages 按唯一 `message.id` / `requestId` 去重后，统计结果是：

```text
input_tokens                 80
cache_creation_input_tokens  295,637
cache_read_input_tokens      5,479,339
output_tokens                67,884
total                        5,842,940
assistant/model calls        44
```

这个数字容易误导人：它看起来像当前上下文有 5.84M token。更准确的说法是：

> 这个 Gmail Bridge 驱动的 Claude Agent SDK session，在 44 次 agentic API calls 中累计处理了约 5.84M usage tokens；其中 5.48M 是 prompt cache reads。后期单轮请求大约处理 180k 输入 token，主要来自 cached conversation / tools / skill / memory / report context，新增输入很少。

这篇是我给自己的学习笔记：把这个 session 拆开，看 Claude Agent SDK、Claude Code harness、Messages API 和 prompt caching 到底分别在做什么。

## 这个 session 实际在做什么

这个会话的 `entrypoint` 是 `sdk-ts`，也就是一个 TypeScript 程序通过 Claude Agent SDK 调起 Claude Code。

业务上，它来自 Gmail Bridge：我转发了投资俱乐部报告，里面有多张截图；agent 识别到这是 investment-club report，于是加载 `investment-club-advisor` skill，结合我的持仓、心法笔记和后续邮件追问来给建议。

表面上的 Gmail 往返不多，大概是：

```text
1. 转发报告图，问该怎么理解
2. 追问“沃什应急”是什么意思
3. 追问是否和上周 Trump 事件有关
4. 贴持仓截图，问 A 股配置
5. 继续问科技100、中光、半导体
6. 贴 ETF 持仓截图纠正“纯光模块”判断
```

但 agent 内部做了很多步：

```text
读 skill
读用户画像/持仓/心法笔记
理解多张图片
查找 notes
生成建议
根据用户追问修正
编辑心法笔记
git add / commit / push
生成最终回复
```

这就是表面“几轮邮件”和实际“44 次模型调用”的差别。

## 三层模型

这次最有用的理解方式，是把它分成三层。

```text
Gmail Bridge
  ↓ 调 Claude Agent SDK query()
Agent SDK / Claude Code harness
  ↓ 组装 prompt、tools、settings、skills、memory、历史 transcript
Messages API call
  ↓ 返回 assistant BetaMessage + BetaUsage
Claude Code 执行 tool_use
  ↓ tool_result 追加回 transcript
下一轮 Messages API call
```

这三层每个 agentic turn 都会经过，但参与方式不同：Messages API 负责实际模型调用，Agent SDK 负责循环，Claude Code harness 负责组装上下文。

## Messages API 层：每次模型调用都有一份 usage

我后来专门去对了一遍官方文档。Claude Code 的 [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript) 把 `query()` 定义为主要交互入口：它返回一个 async generator，持续 stream `SDKMessage`。其中 `SDKAssistantMessage` 里包的是 Anthropic SDK 的 `BetaMessage`。它可以包含文本、thinking、tool_use 等 content blocks，也包含这次模型响应的 `usage`。

用 TypeScript 看，大概是这个形状：

```ts
for await (const message of query({ prompt, options })) {
  if (message.type === "assistant") {
    // message is SDKAssistantMessage
    console.log(message.message.content);
    console.log(message.message.usage);
  }
}
```

这里的 `message.message.usage` 是一次 assistant response 的 usage。整次 `query()` 的最终汇总要看 `SDKResultMessage`。

这个 session 的 jsonl 里，同一个模型响应有时会拆成多条记录：

```text
thinking
text
tool_use
```

它们可能共享同一个 `message.id` 和同一份 usage。如果直接 grep 所有 `usage` 相加，会重复计算。所以我统计时按 `message.id` / `requestId` 去重。

去重之后，这个 session 有 44 次 assistant/model calls。

## Agent SDK 层：一次 query() 可能包含多次模型请求

这是最容易误解的地方。

`query()` 看起来像一个“问 Claude 一个问题”的函数，但在 Claude Code SDK 里，它实际驱动的是一个 agent loop。模型可以要求工具调用；Claude Code 执行工具；工具结果回到 transcript；然后模型继续判断下一步。SDK 文档里 `maxTurns` 这个选项限制的就是 agentic turns，也就是 tool-use round trips。

一个简化流程：

```text
query(prompt)
  → Claude: 我需要读文件
  → Claude Code: 执行 Read
  → tool_result 进入 transcript
  → Claude: 我需要编辑文件
  → Claude Code: 执行 Edit
  → tool_result 进入 transcript
  → Claude: 我需要 git diff
  → Claude Code: 执行 Bash
  → tool_result 进入 transcript
  → Claude: 最终回答
  → SDKResultMessage
```

所以：

```text
一次 Gmail 消息
≠ 一次模型调用

一次 SDK query()
≈ 多次 tool-use round trips
≈ 多次 assistant BetaMessage
≈ 多份 per-response usage
```

## Claude Code harness 层：它决定每轮 prompt 长什么样

Claude Code harness 是 SDK 下面那层运行环境。它会把下面这些东西组织成模型可见上下文：

```text
settings
AGENTS.md / CLAUDE.md / project instructions
available tools
skills listing
selected skill instructions
memory
user messages
tool results
file read results
previous assistant responses
```

这个 session 一开始就带了不少上下文。日志里能看到：

```text
skill_listing        ~23 KB
nested_memory        ~2.3 KB
deferred_tools_delta
agent_listing_delta
task_reminder
Gmail message + images
investment-club-advisor attribution
```

第一轮真实模型调用的 usage 已经是：

```text
input=2
cache_creation=38,696
cache_read=16,081
output=109
total=54,888
```

也就是说，在 agent 正式开始分析之前，系统说明、tools、skills、memory、邮件图片等已经把上下文推到了 5 万 token 级别。

## Prompt caching：为什么 cache_read 会这么大

Anthropic 的 [prompt caching 文档](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) 里，usage 可以按这个公式理解：

```text
total_input_tokens =
  cache_read_input_tokens
+ cache_creation_input_tokens
+ input_tokens
```

几个字段的含义：

```text
input_tokens
  本轮普通输入 token，也就是没有命中 cache 的新 prompt 部分。

cache_creation_input_tokens
  本轮写入 prompt cache 的 token。

cache_read_input_tokens
  本轮从已有 prompt cache 读取的 token。

output_tokens
  Claude 生成的 token，包括文本、tool_use，以及可见/计费口径下的生成内容。
```

所以 `cache_read_input_tokens` 大，不等于“重复上传了这么多新 token”。它表示这轮请求复用了缓存里的长 prompt 前缀。

但它仍然会出现在 usage 里，也仍然说明模型这轮需要带着这段上下文继续工作。缓存降低的是重复前缀的成本和延迟，不会让长上下文从逻辑上消失。

这个 session 的后期单轮大概是：

```text
14:57:15
input=2
cache_creation=200
cache_read=180,635
output=242
total=181,079
```

这不表示你新输入了 18 万 token。它表示这轮模型请求里，约 18 万输入 token 来自缓存读取。

## 为什么累计到 5.84M

这个 session 的单轮输入规模是逐步增长的：

```text
11:58  ~55k / call
12:05  ~105k / call
13:11  ~138k / call
14:25  ~171k / call
14:57  ~181k / call
```

如果一个 agentic run 有 44 次模型调用，每次都读几十万 token 以内的 cached context，累计 usage 就会很快变成几百万。

这是 agent loop + 长上下文 + prompt cache 共同作用的结果。

真正值得问的问题是：

> 这个任务是否真的需要每一轮都带着这么多历史、工具结果、图片内容和 notes diff 继续推理？

对这个 session，我的判断是：不需要。它可以做得更省。

## 这个 session 里的几个具体放大源

第一，邮件图片很大。

最大的几条 user 记录：

```text
line 3    2.6 MB   初始 Fwd，5 张 image
line 106  1.5 MB   后续 Re: Fwd，3 张 image
line 95   585 KB   持仓截图
line 223  344 KB   ETF 持仓截图
```

图片进入多模态上下文后，后续分析会一直受到它们影响。如果不把图片先 OCR / 结构化落盘，而是让原始图片和后续工具结果一直留在 transcript 里，session 会自然变重。

第二，skill 和 memory 的常驻上下文不小。

`investment-club-advisor` 这类 skill 本来就是为了给出贴合我持仓的投资建议，它会读更多个人上下文和历史心法。这是有价值的，但不应该无边界地留在同一个热上下文里。

第三，工具结果会追加进 transcript。

这轮里 agent 回答问题、修改 notes，并执行了 git commit / push。文件编辑 diff、工具结果、提交输出都会作为 `tool_result` 进入 transcript。后续每一轮模型请求都可能继续带着这些历史。

第四，纠偏发生在同一个长 session 里。

围绕 A 股科技100、中光、通信ETF、国产半导体，agent 先后出现几次判断修正。每次修正都留下了：

```text
之前的错误判断
用户纠正
新的解释
新的工具调用
写入 notes 的 diff
最终结论
```

这对可追溯性有好处，但对热上下文成本不好。

## `SDKAssistantMessage`、`SDKResultMessage` 和本地 jsonl 的区别

我现在的理解：

```text
SDKAssistantMessage
  query() stream 中的一次 assistant 响应。
  里面有 BetaMessage 和这一轮的 usage。

SDKUserMessage
  用户消息或 tool_result 回流。

SDKResultMessage
  整个 query/run 结束后的结果汇总。
  这里才更适合看 query 级别的 total cost、turn count、duration、modelUsage。

本地 ~/.claude/projects/*.jsonl
  Claude Code harness 的 transcript / event log。
  它记录得更细，可能把同一个 assistant response 拆成多条 event。
```

所以如果我要做精确统计，最好分两种口径：

```text
per-message forensic:
  从 jsonl 按 message.id 去重，累加每次 BetaUsage。

per-query accounting:
  在 SDK 代码里监听 SDKResultMessage，直接记录 result.usage / total_cost_usd / num_turns / modelUsage。
```

以后监控 Gmail Bridge 成本，应该优先在 SDKResultMessage 层做结构化日志。事后解析 `~/.claude` jsonl 适合 forensic，不适合日常成本观测。

## 我该怎么优化这个系统

第一，给 Gmail Bridge 加 query 级 usage 日志。

每次 `query()` 结束时，把 `SDKResultMessage` 的关键信息落盘：

```text
session_id
num_turns
duration_ms
total_cost_usd
usage.input_tokens
usage.cache_creation_input_tokens
usage.cache_read_input_tokens
usage.output_tokens
modelUsage[model].contextWindow
```

第二，图片先结构化，别让原始图片长时间留在热上下文里。

流程应该是：

```text
image attachments
  → OCR / vision extraction
  → markdown/json artifact
  → 后续只带结构化摘要和必要原文片段
```

第三，长任务要有 state summary。

当同一邮件线程追问超过几轮，agent 应该把当前状态压成短摘要：

```text
用户当前问题
已确认事实
已推翻判断
当前稳定结论
还需要验证的点
notes 已写入哪些内容
```

然后后续轮次带这个 summary，减少全量纠错历史继续留在热上下文里的时间。

第四，工具结果要瘦身。

`git diff`、文件全文、网页抓取、表格输出，默认不应该完整回灌。大部分时候模型只需要：

```text
命令是否成功
关键变更
错误信息
必要片段
```

第五，控制 agentic turns。

对 Gmail 这种异步入口，应该比交互式 CLI 更严格。可以按任务类型设置 `maxTurns`，并在接近上限时要求 agent 收敛，避免继续自己开新分支查下去。

## 给自己的结论

这次的机制可以收敛成一条链路：

```text
Gmail Bridge 触发了一个 SDK query / run
Claude Code harness 注入了 tools、skills、memory、邮件图片和项目上下文
Agent loop 产生了 44 次 assistant model calls
每次工具往返之后，下一轮模型请求继续携带已有 transcript
大段历史命中 prompt cache，形成大量 cache_read_input_tokens
累计 usage 最后显示为 5.84M
```

真正该记住的是：

> 对 agent 系统来说，用户看到的“聊天轮数”不是成本单位。成本单位更接近“模型调用次数 × 当前上下文大小”。Prompt caching 降低重复前缀的成本，但不能替代上下文治理。

</div>

<div data-lang="en">

# Why a Few Claude Agent SDK Turns Used Up My 5-Hour Limit

## Starting Point

When I talk to my agent through a Gmail Bridge, I can email it or forward materials to it; behind the scenes it invokes Claude Code through the Claude Agent SDK, reads my notes, uses tools, and sends the result back.

This investigation started because a few Gmail turns used up my Claude 5-hour limit. The visible interaction was only a handful of email replies, so I checked the local `~/.claude` session logs to see how many model calls actually happened and what the usage looked like.

The heaviest Claude Code SDK session was:

```text
sessionId: 6b42cea1-5c21-41ac-87c6-170780d3ea6e
path: ~/.claude/projects/-Users-sum-Codes-opencode-agent/6b42cea1-5c21-41ac-87c6-170780d3ea6e.jsonl
entrypoint: sdk-ts
model: claude-opus-4-8
created: 2026-07-20 11:58:48 Asia/Shanghai
updated: 2026-07-20 14:57:15 Asia/Shanghai
```

After deduplicating assistant messages by `message.id` / `requestId`, the usage looked like this:

```text
input_tokens                 80
cache_creation_input_tokens  295,637
cache_read_input_tokens      5,479,339
output_tokens                67,884
total                        5,842,940
assistant/model calls        44
```

The number is easy to misread as a 5.84M-token live context. A more precise version:

> This Gmail Bridge driven Claude Agent SDK session accumulated about 5.84M usage tokens across 44 agentic API calls. 5.48M of those were prompt cache reads. Late in the run, a single model call processed roughly 180k input tokens, mostly cached conversation / tools / skill / memory / report context, not fresh user input.

This post is a personal learning note: what happened inside `query()`, how `SDKAssistantMessage` relates to Messages API responses, and why prompt caching makes the usage numbers look the way they do.

## What This Session Was Actually Doing

The `entrypoint` was `sdk-ts`, which means a TypeScript program invoked Claude Code through the Claude Agent SDK.

At the product level, this came from my Gmail Bridge. I forwarded an investment club report with several screenshots. The agent recognized it as an investment-club report, loaded the `investment-club-advisor` skill, read my holdings and prior notes, then answered follow-up questions over email.

The visible Gmail conversation was only a few rounds:

```text
1. Forward report images and ask what they mean
2. Ask what "Wash emergency" means
3. Ask whether it relates to the Trump event from last week
4. Send a holdings screenshot and ask about A-share allocation
5. Ask about 科技100, Chinese optical modules, and semiconductors
6. Send an ETF holdings screenshot to correct the "pure optical module" claim
```

Internally, the agent did much more:

```text
read skill instructions
read user profile / holdings / investment notes
interpret multiple images
search local notes
produce recommendations
revise recommendations after follow-up questions
edit investment notes
run git add / commit / push
produce final replies
```

That is the gap between "a few email turns" and "44 model calls".

## The Three Layers

The cleanest mental model is three layers:

```text
Gmail Bridge
  ↓ calls Claude Agent SDK query()
Agent SDK / Claude Code harness
  ↓ assembles prompt, tools, settings, skills, memory, transcript history
Messages API call
  ↓ returns assistant BetaMessage + BetaUsage
Claude Code executes tool_use
  ↓ tool_result is appended back into the transcript
next Messages API call
```

Every agentic turn passes through these layers, but each layer participates differently: Messages API performs the model call, Agent SDK drives the loop, and the Claude Code harness assembles context.

## Messages API Layer: Every Model Call Has Usage

I later checked this against the official docs. The Claude Code [TypeScript SDK reference](https://code.claude.com/docs/en/agent-sdk/typescript) defines `query()` as the primary interaction entry point: it returns an async generator that streams `SDKMessage` values. In that stream, `SDKAssistantMessage` wraps a `BetaMessage` from the Anthropic SDK. That message may contain text, thinking blocks, tool_use blocks, and the usage for that one assistant response.

In TypeScript, the shape is roughly:

```ts
for await (const message of query({ prompt, options })) {
  if (message.type === "assistant") {
    // message is SDKAssistantMessage
    console.log(message.message.content);
    console.log(message.message.usage);
  }
}
```

`message.message.usage` is the usage for one assistant response. The final summary for the whole `query()` run belongs to `SDKResultMessage`.

In my local jsonl, the same model response can be split across several events:

```text
thinking
text
tool_use
```

Those events may share the same `message.id` and the same usage object. If I simply grep and sum every `usage`, I will overcount. That is why I deduplicated by `message.id` / `requestId`.

After deduplication, this session had 44 assistant/model calls.

## Agent SDK Layer: One query() Is Not One Model Request

This is the easiest part to misunderstand.

`query()` looks like a function that asks Claude one question. In Claude Code SDK, it actually drives an agent loop. The model can ask to use a tool. Claude Code executes the tool. The tool result goes back into the transcript. Then the model continues from there. The SDK option `maxTurns` points to the same model: it limits agentic turns, meaning tool-use round trips.

A simplified flow:

```text
query(prompt)
  → Claude: I need to read a file
  → Claude Code: runs Read
  → tool_result enters transcript
  → Claude: I need to edit a file
  → Claude Code: runs Edit
  → tool_result enters transcript
  → Claude: I need git diff
  → Claude Code: runs Bash
  → tool_result enters transcript
  → Claude: final answer
  → SDKResultMessage
```

So:

```text
one Gmail message
≠ one model call

one SDK query()
≈ multiple tool-use round trips
≈ multiple assistant BetaMessages
≈ multiple per-response usage objects
```

## Claude Code Harness Layer: It Decides What the Prompt Contains

The Claude Code harness is the runtime layer underneath the SDK. It decides what goes into the model-visible context:

```text
settings
AGENTS.md / CLAUDE.md / project instructions
available tools
skills listing
selected skill instructions
memory
user messages
tool results
file read results
previous assistant responses
```

This session started with a nontrivial amount of context. The log shows:

```text
skill_listing        ~23 KB
nested_memory        ~2.3 KB
deferred_tools_delta
agent_listing_delta
task_reminder
Gmail message + images
investment-club-advisor attribution
```

The first real model call already had this usage:

```text
input=2
cache_creation=38,696
cache_read=16,081
output=109
total=54,888
```

Before the agent really started doing the investment analysis, the system prompt, tools, skills, memory, email content, and images had already pushed the context into the 50k-token range.

## Prompt Caching: Why cache_read Gets So Large

In Anthropic's [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), the input-side token count is best understood as:

```text
total_input_tokens =
  cache_read_input_tokens
+ cache_creation_input_tokens
+ input_tokens
```

The fields mean:

```text
input_tokens
  Normal input tokens for this request, after the last cache breakpoint.

cache_creation_input_tokens
  Tokens written into prompt cache by this request.

cache_read_input_tokens
  Tokens read from an existing prompt cache entry by this request.

output_tokens
  Tokens generated by Claude, including text and tool_use content under the accounting model.
```

Large `cache_read_input_tokens` does not mean I uploaded that many fresh tokens again. It means the request reused a large cached prompt prefix.

But those tokens still show up in usage, and they still represent context the model is carrying while continuing the task. Prompt caching lowers the cost and latency of repeated prefixes. It does not eliminate the need to manage context.

Near the end of this session, a single model call looked like this:

```text
14:57:15
input=2
cache_creation=200
cache_read=180,635
output=242
total=181,079
```

That does not mean I typed 180k new tokens. It means this request read about 180k input tokens from cache.

## Why the Total Reached 5.84M

The per-call input size grew over time:

```text
11:58  ~55k / call
12:05  ~105k / call
13:11  ~138k / call
14:25  ~171k / call
14:57  ~181k / call
```

If an agentic run makes 44 model calls and each call reads a large cached context, cumulative usage reaches millions quickly.

This is the natural result of agent loop + long context + prompt caching.

The real question is:

> Did this task need every later turn to keep carrying all of that history, tool output, image-derived context, and notes diff?

For this session, my answer is no. It could have been cheaper.

## Specific Amplifiers in This Session

First, the email images were large.

The biggest user records were:

```text
line 3    2.6 MB   initial forwarded email, 5 images
line 106  1.5 MB   follow-up email, 3 images
line 95   585 KB   holdings screenshot
line 223  344 KB   ETF holdings screenshot
```

Once images enter the multimodal context, later analysis may continue to carry their extracted context. If I do not OCR / structure them into an artifact first, the hot transcript gets heavy quickly.

Second, skill and memory context were nontrivial.

`investment-club-advisor` is intentionally context-rich. It needs my holdings, preferences, and prior investment notes. That context is valuable, but it should not remain unbounded in one hot transcript.

Third, tool results are appended to the transcript.

This run answered questions, edited notes, and ran git commands. File diffs, command outputs, and edit results became tool results. Later model calls could keep carrying those results.

Fourth, correction happened inside the same long session.

The agent revised its view several times around 科技100, Chinese optical modules, communication ETFs, and semiconductors. Each correction left behind:

```text
the previous wrong claim
my correction
the revised reasoning
new tool calls
notes edits
the final conclusion
```

That is good for traceability, but bad for hot context cost.

## SDKAssistantMessage, SDKResultMessage, and Local jsonl

My current mental model:

```text
SDKAssistantMessage
  One assistant response in the query() stream.
  Contains a BetaMessage and per-response usage.

SDKUserMessage
  User message or tool_result flowing back into the transcript.

SDKResultMessage
  Final summary of the whole query/run.
  Better place for total cost, turn count, duration, and modelUsage.

~/.claude/projects/*.jsonl
  Claude Code harness transcript / event log.
  More granular than SDK-level accounting.
  It may split one assistant response into multiple events.
```

For precise accounting, I should keep two views:

```text
per-message forensic:
  parse jsonl, deduplicate by message.id, sum each BetaUsage.

per-query accounting:
  log SDKResultMessage directly from the SDK app:
  usage, total_cost_usd, num_turns, duration_ms, modelUsage.
```

For monitoring Gmail Bridge costs, the second one is the right place to start. Parsing `~/.claude` jsonl is useful for forensic analysis, less useful as the primary daily cost signal.

## How I Should Improve This System

First, log query-level usage from Gmail Bridge.

At the end of each `query()`, persist the important fields from `SDKResultMessage`:

```text
session_id
num_turns
duration_ms
total_cost_usd
usage.input_tokens
usage.cache_creation_input_tokens
usage.cache_read_input_tokens
usage.output_tokens
modelUsage[model].contextWindow
```

Second, structure images before letting the agent run long.

The pipeline should be:

```text
image attachments
  → OCR / vision extraction
  → markdown/json artifact
  → later turns carry only summary and necessary excerpts
```

Third, introduce state summaries for long email threads.

After several follow-up turns in the same thread, the agent should compress state into:

```text
current user question
confirmed facts
claims that were corrected
current stable conclusion
open verification points
notes already written
```

Then later turns should carry that summary and stop dragging the full correction history through the hot context.

Fourth, slim down tool results.

`git diff`, full files, fetched pages, and large tables should not be blindly returned in full. Most of the time the model only needs:

```text
whether the command succeeded
key changes
error messages
necessary excerpts
```

Fifth, control agentic turns.

For an asynchronous entry point like Gmail, I should be stricter than in an interactive CLI. Set `maxTurns` by task type. When the run approaches the limit, make the agent converge and avoid opening new branches.

## Takeaway

The mechanism is:

```text
Gmail Bridge started an SDK query / run
Claude Code harness injected tools, skills, memory, email images, and project context
the agent loop produced 44 assistant model calls
after tool-use round trips, later model calls kept carrying the growing transcript
large repeated prefixes hit prompt cache
cache_read_input_tokens accumulated to 5.48M
total usage showed 5.84M
```

The useful lesson:

> For agent systems, visible chat turns are not the cost unit. A better approximation is model calls multiplied by current context size. Prompt caching reduces the cost of repeated prefixes, but it cannot replace context management.

</div>
