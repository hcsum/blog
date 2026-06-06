---
title: "OpenCode Agent Memory — Design Note"
description: "Design and implementation note for the long-term memory feature of a personal OpenCode agent: file-and-protocol storage, eager index recall, auto-capture, and LLM compaction."
date: 2026-06-06
tags: ["Agent", "OpenCode", "LLM", "Design"]
draft: false
---

# OpenCode Agent Memory — Design Note

Design + implementation note for long-term memory in a personal assistant built on [OpenCode](https://opencode.ai/). Single user, file-based, git-backed. No vector store, no external service. All integration is through OpenCode's own plugin/SDK surface.

Scope: the OpenCode interactive client path only. The Gmail bridge path can reuse the same files later but is out of scope here.

## Model

Memory = **markdown files + a write protocol + an always-loaded index**. Two requirements from the platform: (a) inject the index into context every session, (b) give the model a writing protocol. OpenCode provides both natively, so there is no bespoke storage engine.

Storage choice is file-based by default for a single user with a small store; the design effort is in capture and maintenance, not storage.

Trade-off accepted: no semantic recall and an index that grows linearly with the number of facts. In exchange the store is transparent, hand-editable, git-diffable, reuses the existing `notes` sync, and needs no extra service or schema. At single-user scale the linear index is cheap (one line per fact); a vector store would buy semantic match at the cost of an embedding pipeline, a query step, and opaque state — not worth it until the store is large.

## Storage layout

```
notes/memory/
  MEMORY.md            # index, auto-generated, injected every session
  <type>-<name>.md     # one fact per file
  _CONFLICTS.md        # unresolved contradictions (only when present)
.opencode/memory/PROTOCOL.md     # write protocol (main repo, versioned w/ code)
.opencode/plugin/memory.ts       # capture + maintenance plugin (main repo)
.data/memory-extract-watermark.json   # per-session extraction watermark (gitignored)
.data/memory-compact-state.json       # churn / last-attempt / last-compacted (gitignored)
```

Data lives in the `notes` repo (persisted, synced across machines). Protocol and code live in the main repo (versioned with the feature).

Memory file format:

```markdown
---
name: <kebab-slug>
description: <one-line recall hook>
metadata:
  type: user | feedback | project | reference
---

<the fact. For feedback/project, add a "Why:" line. Link related memories with [[name]].>
```

Index line format: `- [Title](file.md) — hook`.

Taxonomy: `user` (identity, stable preferences, accounts, tools), `feedback` (a correction or confirmed way of working, with the why), `project` (ongoing goal/constraint not derivable from the repo), `reference` (pointer to an external resource).

## Recall — eager index, lazy bodies

`opencode.json`:

```json
"instructions": [".opencode/memory/PROTOCOL.md", "notes/memory/MEMORY.md"]
```

`config.instructions` loads its files into context at every session start. So the protocol + full index are always present; bodies are read on demand when an index line looks relevant. Zero code.

Decision — index is eager, not fetched on demand. Grep-on-demand was rejected: the agent only searches once it suspects a memory exists, but it can't suspect what isn't in view. That keeps explicit recall ("what's my email?") and loses implicit recall (applying a known preference unprompted), which is the valuable part. Eager index + lazy bodies is the split that keeps the cheap layer (one line/fact, ~15–25 tokens) in context and defers the expensive layer.

Decision — inject the index only, not the bodies. Injecting the top-N relevant bodies up front (via `experimental.chat.system.transform`) would improve recall precision, but it depends on an experimental hook and a relevance ranker. The current bet is that an always-present index + on-demand `read` is good enough while the store is small. Trade-off: recall of a body still relies on the model choosing to expand the right index line; a poorly-written `description` hook can be missed.

Compromise: the index is injected every session, so its cost is fixed-per-session and monotonically growing — there is no automatic reclaim. Acceptable while small. Growth path when it gets large: a `chat.message` hook that greps per user message and injects only matching entries (keeps recall automatic, drops the fixed cost, at the price of keyword-vs-semantic match quality). Deferred until it hurts.

## Capture

Goal: true auto-capture — record durable facts the user never explicitly asked to keep, not just the ones flagged with "remember". Four candidate triggers were weighed:

| Mechanism | How | Truly auto | Cost | Decision |
|---|---|---|---|---|
| explicit "remember" | user says it, model writes | no (manual) | 0 | folded into keyword save |
| model self-records mid-turn | protocol nudges the model to write as it goes | half (unreliable) | 0 | cut — flaky, redundant once extraction exists |
| background extraction | mine new messages after idle | yes | ~1 cheap LLM call per paused round | main |
| keyword force-save | regex → forced save instruction | instant top-up | 0 | kept |

Chosen: background extraction as the workhorse + keyword force-save for instant needs. This is more automatic than the implementations surveyed (keyword-only or hand-curated), and the price is explicit:

- **Noise.** Auto-capture will occasionally save something irrelevant. Mitigated by a high bar in the protocol, deduping against existing bodies, and compaction. This is the main cost of going past keyword-only.
- **Latency.** Background capture lands ~1 debounce window after the user pauses, not instantly — hence keyword force-save as the instant path.
- **Per-round LLM cost.** One cheap model call per paused round (not per turn — see debounce). Bounded, but non-zero, so the model defaults to a cheap one.

Two mechanisms ship, both in `memory.ts`.

### Background extraction (`session.idle`, debounced)

`session.idle` fires every turn. The plugin debounces (default 60s); extraction runs once the user actually pauses.

Per run:

1. Read messages since the per-session watermark (`.data/memory-extract-watermark.json`). Incremental; transcript is bounded (`MAX_NEW_MESSAGES=40`, `MAX_TRANSCRIPT_CHARS=24000`).
2. Send new messages + existing memory bodies (capped at `MAX_EXTRACT_CONTEXT_CHARS=12000`, index fallback) to a cheap model with the protocol's bar.
3. Model returns a JSON array of `{action, type, name, description, body}`.
4. Write to `notes/memory/*.md`, rebuild the index, advance the watermark, bump churn.

The model is called via `ctx.client`: create a temporary session, prompt a small model, read the result, delete the session. Reuses OpenCode's configured provider — no extra API key. Internal sessions are tracked so their own `session.idle` events don't recurse into more extraction.

`session.deleted` triggers a best-effort final extraction so the debounce window doesn't drop the last round.

Design notes / trade-offs:

- Debounce length trades cost against loss risk: longer = fewer LLM calls but a bigger window to lose if the process dies mid-window. Mitigated by the watermark (the next session resumes from where it left off) and the `session.deleted` flush.
- Incremental watermark bounds tokens. If the watermark message can't be found (e.g. truncated history), it falls back to the last `MAX_NEW_MESSAGES` rather than re-reading everything — bounded, at the risk of skipping older unmined messages.
- Reusing OpenCode's provider via `ctx.client` avoids a second API key and infra, but ties extraction quality to whatever cheap model that provider offers.

### Keyword force-save (`chat.message`)

For "save this now". A regex (`记住 / remember / save this / don't forget`, code blocks stripped first) matches the user message and injects a synthetic instruction telling the model to persist immediately per the protocol. Instant; covers the latency gap of background extraction.

## Maintenance

### Layer A — index rebuild (deterministic, no LLM)

`MEMORY.md` is regenerated from file frontmatter on every maintenance pass. Files are the source of truth; the index is a pure derivative and is never hand-edited, so index↔body drift can't accumulate.

### Layer B — compaction (LLM)

Triggers: write **churn** ≥ `MEMORY_COMPACT_CHURN` (default 8) since last pass, OR wall-clock **interval** ≥ `MEMORY_COMPACT_INTERVAL_MS` (default 12h). A polling timer (`MEMORY_COMPACT_POLL_MS`, clamped ≥60s) checks the interval. Runs only with ≥ `MEMORY_COMPACT_MIN_ENTRIES` files.

Why both triggers: churn alone would never fire on a store that's read often but rarely written; the interval guarantees a floor. The interval alone would let a high-write burst pile up duplicates between passes; churn cleans those up promptly. Trade-off: the interval means a compaction can run on an otherwise idle machine, and the first run after a restart fires eagerly (no recorded last-pass).

A cheap model reads the whole store and returns a reconciliation plan of ops:

- `merge` near-duplicate files into one, delete the sources
- `delete` clearly stale / superseded entries
- `rewrite` one entry in place
- `flag` a genuine contradiction

Bias: conservative. The store is the assistant's durable knowledge; a wrong merge or delete loses real information, while leaving a duplicate around costs little. So the model is told to prefer keeping over losing, and the apply step is defensive. The deliberate compromise is that the store stays slightly messier than a maximally-aggressive pass would leave it.

Constraints:

- Contradictions are flagged, never auto-resolved. Conflicting facts where the current truth is unknown go to `_CONFLICTS.md` and raise a banner in the index. Both sides are kept. (Picking a side on a guess is the one unrecoverable failure mode, so it's disallowed outright.)
- A git checkpoint commit is taken in the notes repo before applying ops, so a bad pass is revertable. No git ⇒ no destructive ops (compaction aborts). Trade-off: an environment without git in the notes repo gets index rebuild (Layer A) but no compaction.
- State (`churn`, `lastAttemptedAt`, `lastCompactedAt`) is persisted so a full compaction isn't re-run on every idle event.
- Filenames passing destructive ops are validated against a safe pattern.
- Whole-store single pass (no clustering). Simple and lets the model see every cross-file relationship at once; the cost is a size ceiling (below).

### Models

Both passes default to `openai/gpt-5-mini` (cheap), overridable via `MEMORY_EXTRACT_MODEL` / `MEMORY_COMPACT_MODEL`. Earlier they fell back to the session model (`openai/gpt-5.4`) on every idle pause — wrong for a constantly-running job; fixed.

Extraction `update` previously overwrote a file while the model had only seen the one-line index (blind rewrite, could drop detail). Now the extractor receives full existing bodies and the protocol requires an update body to carry over still-valid content.

## Boundaries

| | Knowledge wiki | Memory | `AGENTS.md` |
|---|---|---|---|
| Holds | topic/world knowledge, ingested sources | facts about the user and how to work with them | durable agent behavior rules |
| Rhythm | explicit ingest/query | auto-accumulating, self-correcting | rarely changes |
| Test | "knowledge about a topic?" | "about the user / our way of working?" | "permanent behavior rule?" |

A recurring `feedback` memory that stabilizes can be promoted into `AGENTS.md` by hand. Memory never modifies the user's authoritative profile file.

## Config (env)

| Var | Default | Meaning |
|---|---|---|
| `MEMORY_EXTRACT_ENABLED` | 1 | background extraction on/off (keyword save unaffected) |
| `MEMORY_EXTRACT_DEBOUNCE_MS` | 60000 | idle debounce before extraction |
| `MEMORY_EXTRACT_MODEL` | `openai/gpt-5-mini` | extraction model |
| `MEMORY_COMPACT_ENABLED` | 1 | compaction on/off |
| `MEMORY_COMPACT_CHURN` | 8 | writes since last pass that trigger compaction |
| `MEMORY_COMPACT_MIN_ENTRIES` | 2 | min files before compaction runs |
| `MEMORY_COMPACT_INTERVAL_MS` | 43200000 | force a pass at least this often (12h) |
| `MEMORY_COMPACT_POLL_MS` | 600000 | interval due-check cadence (clamped ≥60s) |
| `MEMORY_COMPACT_MODEL` | = extract model | compaction model |

## Deferred by design

Cut on purpose, not oversights — revisit when the store grows or a need shows up:

- Semantic / vector recall (embeddings). Until index recall gets imprecise.
- Injecting top-N relevant bodies via `experimental.chat.system.transform`. Recall-precision upgrade; depends on an experimental hook.
- Importance scoring / recency decay / auto-forget. Currently leaning on dedupe + compaction + manual review instead.
- Custom `memory_save` / `memory_search` tools to harden the write format vs. the model hand-writing frontmatter.
- Multi-user scope (single user) and Gmail-bridge reuse (same files, not wired yet).

## Known gaps

- Single-pass compaction has a size ceiling (`MAX_COMPACT_CHARS=60000`); over it the pass is skipped until the next cycle. Needs clustered/batched compaction.
- No cross-process lock; two OpenCode processes could compact the same dir concurrently.
- The notes-memory path is duplicated between `opencode.json` `instructions` and the plugin constant. Cleanest fix: move recall injection into the plugin and source the path once.
- The extraction/compaction system prompts overlap with `PROTOCOL.md` (categories, the high bar, dedupe rules) — drift risk. Single-source fix: read `PROTOCOL.md` at runtime instead of duplicating its rules in code.
