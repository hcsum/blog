---
title: "我为什么给 agent 加了 memory，最后又把它删了 / Why I Added Memory to My Agent and Then Removed It"
description: "A bilingual engineering postmortem on building, tightening, and ultimately disabling long-term memory in my OpenCode agent."
date: 2026-07-01
tags: ["Agent", "OpenCode", "Memory", "LLM", "Postmortem"]
bilingual: true
defaultLang: "zh"
draft: false
---

## TL;DR / TL;DR

<div data-lang="zh">
  <p>我给自己的 OpenCode agent 做过一整套长期记忆：先是文件式 memory，后来切到 mem0 + Qdrant，再后来把抽取逻辑整个收回自己控制，最后还是把它默认关掉了。</p>
  <p>原因并不复杂：自动 memory 最大的问题不是“能不能记住”，而是“记住的东西值不值得信”。当一个系统会稳定地记住一些低价值、半正确、难审计的东西时，它带来的不是 continuity，而是新的维护负担。最后我决定回到更朴素的方案：重要信息显式写进 <code>notes/</code>，让 notes 做 truth，而不是让一个不透明的自动记忆层做 truth。</p>
</div>

<div data-lang="en">
  <p>I built a full long-term memory system for my OpenCode agent: first a file-based version, then a mem0 + Qdrant version, then a stricter version where I owned extraction myself. In the end, I turned the whole thing off by default.</p>
  <p>The reason was simple: the hardest part of automatic memory is not recall, but truth quality. Once a system reliably stores low-value, half-correct, hard-to-audit facts, it stops being continuity and starts being maintenance overhead. I eventually went back to a simpler rule: if something matters, write it explicitly into <code>notes/</code>. Notes should be the truth layer, not an opaque auto-memory pipeline.</p>
</div>

## Timeline / 时间线

| Date | Commit | Shift |
|---|---|---|
| 2026-06-06 | `63cb854` | Added the first file-based memory plugin and `PROTOCOL.md` |
| 2026-06-16 | `63697a4` | Switched long-term memory to mem0 + Qdrant |
| 2026-06-22 | `6ca24a0` | Stopped using mem0 extraction; owned extraction with `infer:false` |
| 2026-06-24 | `b903f25` | Added role-grounded gate and `core`/`text` dedup |
| 2026-06-26 | `da36bf4`, `a5ef9e9` | Disabled extraction and recall by default |

## Starting Simple / 从一个简单版本开始

<div data-lang="zh">
  <p>最开始那版 memory 其实很朴素。我想要的东西也很朴素：agent 不要每次都从零认识我，不要每次都重新学一遍怎么跟我协作。</p>
  <p>所以第一版直接走文件方案。每条 memory 一个 markdown 文件，<code>notes/memory/MEMORY.md</code> 做索引，索引在每次会话启动时注入上下文。写入协议放在 <code>.opencode/memory/PROTOCOL.md</code>，自动抽取逻辑放在 <code>.opencode/plugin/memory.ts</code>。</p>
  <p>这个方案的优点非常明显：可见、可改、可 diff、可 grep。对单用户系统来说，它几乎是最容易信任的一种形态。</p>
</div>

<div data-lang="en">
  <p>The first version was intentionally simple. I wanted the agent to stop relearning who I was and how I liked to work every time a new session started.</p>
  <p>So the first implementation was file-based. Each memory lived in its own markdown file, <code>notes/memory/MEMORY.md</code> was the index, and that index was injected into every new session. The write protocol lived in <code>.opencode/memory/PROTOCOL.md</code>, and automatic extraction lived in <code>.opencode/plugin/memory.ts</code>.</p>
  <p>The strengths were obvious: everything was visible, editable, diffable, and grep-able. For a single-user system, that is a very trustworthy shape.</p>
</div>

## Why I Switched to mem0 / 为什么我又切到 mem0

<div data-lang="zh">
  <p>问题在召回成本。文件式方案本质上是 eager recall：索引会一直跟着上下文走。memory 越多，上下文越大，成本就是 <code>O(n)</code>。</p>
  <p>到了 6 月中旬，我开始想把召回改成 pull-based：不要把整份记忆塞进每轮对话，而是在需要时按 query 取 top-k。于是我在 <code>63697a4</code> 这个提交里把长期记忆切到 mem0 + Qdrant，把索引常驻注入换成 <code>search_memories</code> 工具。</p>
  <p>这一步从架构上看是对的。它解决了文件索引会无限膨胀的问题，也让 memory 更像一个检索层，而不是一块不断增长的 prompt。</p>
</div>

<div data-lang="en">
  <p>The problem was recall cost. The file-based version was eager recall: the index always traveled with the prompt. As memory grew, context grew with it. The cost was fundamentally <code>O(n)</code>.</p>
  <p>By mid-June, I wanted pull-based recall instead: do not inject the whole memory store into every conversation, only fetch top-k items when the agent actually needs them. That led to commit <code>63697a4</code>, where I switched long-term memory to mem0 + Qdrant and replaced eager injection with a <code>search_memories</code> tool.</p>
  <p>Architecturally, this move was correct. It removed the unbounded prompt growth problem and turned memory into a retrieval layer instead of an ever-growing block of context.</p>
</div>

## The Real Problem Was Extraction / 真正的问题其实是抽取

<div data-lang="zh">
  <p>切到向量检索之后，我很快发现：召回不是最难的部分，抽取才是。</p>
  <p>mem0 默认的抽取器是高召回取向的。对于“不要漏掉任何可能有用的东西”这类目标，它很合理；但对于“只记录少量高价值、长期成立、关于用户本人的事实”这种目标，它会记太多。再加上我当时用的是更轻量的模型，它能看到的上下文有限，于是就开始出现各种典型脏写：</p>
</div>

<div data-lang="en">
  <p>After the switch to vector retrieval, I realized recall was not the hard part. Extraction was.</p>
  <p>mem0's default extractor is tuned for high recall. That makes sense if your goal is “do not miss potentially useful facts.” It is much less useful when your target is “store only a small number of durable, high-value facts about the user.” Combined with a lighter model and limited context, the system started producing very recognizable kinds of junk:</p>
</div>

<div data-lang="zh">
  <ul>
    <li>assistant 把 “User wants X” 重新表述一遍，系统就把它当成用户事实存起来</li>
    <li>研究过程中的发现、一次性的交付总结、临时 debug 状态，被错误地写进长期记忆</li>
    <li>“以后想做什么”“之后再跟进什么” 这种 open loop，被当成 stable truth</li>
    <li>同一个事实因为表述略有不同，被存成多条近重复 memory</li>
  </ul>
</div>

<div data-lang="en">
  <ul>
    <li>The assistant restated “User wants X,” and the system stored that restatement as a user fact</li>
    <li>Research findings, one-off delivery summaries, and temporary debugging state leaked into long-term memory</li>
    <li>Open loops such as “I want to do this later” were stored as if they were stable truth</li>
    <li>The same fact accumulated as multiple near-duplicates because the wording changed slightly</li>
  </ul>
</div>

<div data-lang="zh">
  <p>我后来有个很明确的感受：我并不是在设计一个 memory system，我是在设计一个垃圾过滤器。</p>
</div>

<div data-lang="en">
  <p>At some point the feeling became clear: I was no longer designing a memory system. I was designing a garbage filter.</p>
</div>

## Taking Control Back / 把控制权收回来

<div data-lang="zh">
  <p>接下来这轮改动，是整条线里技术上最认真的一段。我先尝试过在 mem0 的 prompt 外面继续加 gate、加 regex 清理，但那只是补丁，不是控制权。</p>
  <p>所以到 <code>6ca24a0</code> 这次提交，我直接停掉了 mem0 自带的 <code>infer:true</code> 抽取器，改成自己写 judge：先检索邻近 memory 做去重上下文，再让 <code>.opencode/lib/mem0-judge.ts</code> 按 <code>EXTRACTION_GATE.md</code> 输出明确的 <code>ADD</code>/<code>UPDATE</code> 决策，最后用 <code>infer:false</code> 落库。换句话说，mem0 从“帮我判断该记什么”降级成“只负责存和搜”。</p>
  <p>两天后，在 <code>b903f25</code> 里我又把 gate 收紧了一轮，核心规则是下面这几条：</p>
</div>

<div data-lang="en">
  <p>The next round was the most serious engineering work in the whole experiment. I first tried adding more gate text and regex cleanup around mem0, but that was patching behavior, not owning it.</p>
  <p>So in commit <code>6ca24a0</code>, I stopped using mem0's built-in <code>infer:true</code> extractor entirely and wrote my own judge. The flow became: retrieve nearby memories for dedup context, run <code>.opencode/lib/mem0-judge.ts</code> with <code>EXTRACTION_GATE.md</code>, get explicit <code>ADD</code>/<code>UPDATE</code> decisions, then write them with <code>infer:false</code>. In other words, mem0 stopped deciding what mattered and became a storage-and-retrieval layer only.</p>
  <p>Two days later, in <code>b903f25</code>, I tightened the gate again. The core rules were:</p>
</div>

<div data-lang="zh">
  <ul>
    <li><code>WHO SAID IT</code>：关于用户的 claim 必须有用户自己的发言作证据</li>
    <li><code>TRUTH, NOT OPEN LOOPS</code>：“想做 / 待跟进 / 之后再看” 是任务，不是真相</li>
    <li><code>RESEARCH -&gt; wiki</code>：外部研究结论进 wiki，不进 user memory</li>
    <li><code>core</code> / <code>text</code>：用原子事实做去重 key，用自包含措辞做实际存储</li>
  </ul>
</div>

<div data-lang="en">
  <ul>
    <li><code>WHO SAID IT</code>: a claim about the user must be grounded in the user's own words</li>
    <li><code>TRUTH, NOT OPEN LOOPS</code>: “want to do / follow up / revisit later” is a task, not a truth</li>
    <li><code>RESEARCH -&gt; wiki</code>: external research findings belong in the wiki, not user memory</li>
    <li><code>core</code> / <code>text</code>: use an atomic fact as the dedup key, and a self-contained phrasing as the stored form</li>
  </ul>
</div>

<div data-lang="zh">
  <p>这些改动确实让质量变好了，但它没有改变一件更底层的事：这套系统仍然在用 LLM 自动决定 truth，而 truth layer 又是一个向量库。它变得更可控了，但没有变得真正让我放心。</p>
</div>

<div data-lang="en">
  <p>These changes did improve quality, but they did not change the more fundamental fact: the system was still using an LLM to decide truth, and the truth layer was still a vector store. It became more controlled, but not truly trustworthy.</p>
</div>

## Why I Removed It Anyway / 为什么最后还是把它关了

<div data-lang="zh">
  <p>最终让我放弃的原因有三个。</p>
  <ol>
    <li><strong>它仍然会记很多不值得记的东西。</strong> 哪怕规则已经很重，只要抽取是自动的、模型上下文又不完整，低价值内容就总会漏进来。更强的模型不一定解决这个问题，很多时候只会把垃圾写得更像正确答案。</li>
    <li><strong>它很难 audit。</strong> 后来我最在意的不是“能不能搜出来”，而是“这条事实为什么在这里”。在文件式方案里，文件本身就是 truth；在 mem0/Qdrant 方案里，snapshot 只是派生审计面，不是 source of truth。这个差别会直接影响信任感。</li>
    <li><strong>它开始反过来消耗我的注意力。</strong> 我本来是想让 memory 帮我减少重复劳动，结果越来越多时间花在给 memory 补规则、清垃圾、解释边界、修复误记。到这个阶段，它已经没有在服务产品目标，而是在制造一个新的维护面。</li>
  </ol>
  <p>所以 6 月 26 日我把自动抽取和召回都改成 opt-in：<code>MEMORY_EXTRACT_ENABLED</code> 默认关闭，<code>MEMORY_RECALL_ENABLED</code> 默认关闭，agent-facing 的 protocol 和提示也从常驻上下文里撤掉。</p>
</div>

<div data-lang="en">
  <p>Three reasons made me shut it down.</p>
  <ol>
    <li><strong>It still stored too many things that were not worth storing.</strong> Even with heavy rules, fully automatic extraction plus incomplete model context will keep leaking low-value facts. A stronger model does not necessarily solve this; often it just makes junk sound more convincing.</li>
    <li><strong>It was hard to audit.</strong> What I cared about most was no longer “can the agent recall this,” but “why is this fact here.” In the file-based version, the file itself was the truth. In the mem0/Qdrant version, the snapshot was only a derived audit surface, not the source of truth. That difference matters a lot for trust.</li>
    <li><strong>It started consuming my attention instead of saving it.</strong> The whole point of memory was to reduce repetitive work. Instead, I kept spending time tightening rules, cleaning junk, explaining boundaries, and fixing false memories. At that point, the system was no longer serving the product. It had become its own maintenance surface.</li>
  </ol>
  <p>So on June 26, I made both extraction and recall opt-in: <code>MEMORY_EXTRACT_ENABLED</code> defaults to off, <code>MEMORY_RECALL_ENABLED</code> defaults to off, and the agent-facing protocol was removed from always-loaded context.</p>
</div>

## What I Kept / 我保留了什么

<div data-lang="zh">
  <p>我并不是放弃了“记忆”这件事，我只是放弃了“隐式、自动、不可见的记忆层”。</p>
  <p>现在我更信任的是几类显式文件：</p>
  <ul>
    <li><code>notes/user.md</code>：关于我的稳定画像和长期约束</li>
    <li><code>notes/todos.md</code>：开环事项和当前推进中的线程</li>
    <li><code>notes/knowledge/</code>：通过 llm-wiki 沉淀的外部知识和研究结论</li>
  </ul>
  <p>这套东西没有那么“自动”，但它有一个非常重要的优点：我知道它为什么存在，也知道要去哪里改它。</p>
</div>

<div data-lang="en">
  <p>I did not give up on memory itself. I gave up on an implicit, automatic, mostly invisible memory layer.</p>
  <p>What I trust now is a set of explicit files:</p>
  <ul>
    <li><code>notes/user.md</code> for durable facts and long-term constraints about me</li>
    <li><code>notes/todos.md</code> for open loops and active workstreams</li>
    <li><code>notes/knowledge/</code> for external knowledge and research captured through the llm-wiki flow</li>
  </ul>
  <p>It is less magical, but it has one major advantage: I know why it exists, and I know exactly where to edit it.</p>
</div>

## What I’d Do Differently Next Time / 如果以后再做，我会怎么做

<div data-lang="zh">
  <ol>
    <li><strong>让可审计的形式做 truth。</strong> 如果最后还是要靠 snapshot 来解释系统在干什么，那说明 truth layer 放错地方了。</li>
    <li><strong>让 LLM 提建议，不让它拥有真相。</strong> 模型可以负责提取候选项、打标签、做排序，但最终的 durable record 应该落在更容易审计的介质上。</li>
    <li><strong>先从显式 memory 出发，再决定哪些值得自动化。</strong> 自动化应该建立在一个已经可信的手工流程之上，而不是反过来要求规则去拯救一个不可信的自动流程。</li>
  </ol>
</div>

<div data-lang="en">
  <ol>
    <li><strong>Make the auditable form the source of truth.</strong> If you need a derived snapshot to explain what the system is doing, your truth layer is probably in the wrong place.</li>
    <li><strong>Let the LLM propose, not own reality.</strong> The model can extract candidates, label them, or rank them. The durable record should still live in something easier to inspect.</li>
    <li><strong>Start from explicit memory, then decide what is worth automating.</strong> Automation should sit on top of an already trustworthy manual workflow, not the other way around.</li>
  </ol>
</div>

## Closing / 结尾

<div data-lang="zh">
  <p>这段尝试对我来说并不算失败。它让我更清楚一件事：agent memory 真正难的不是“存”和“搜”，而是“什么才配被长期记住”。如果这个问题没有被解决，memory 只会把噪音持久化。</p>
  <p>所以至少在现在，我更愿意让 agent 依赖显式 notes，而不是依赖一个自动、隐式、向量库驱动的记忆层。</p>
</div>

<div data-lang="en">
  <p>I do not consider this experiment a failure. It clarified the real problem: the hard part of agent memory is not storing or retrieving, but deciding what deserves to persist. If that part is weak, memory just turns noise into durable state.</p>
  <p>So for now, I would rather have my agent rely on explicit notes than on an automatic, implicit, vector-database-backed memory layer.</p>
</div>
