"use client";

import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import Matter from "matter-js";
import { useEffect, useMemo, useRef, useState } from "react";

type TodoStatus = "active" | "falling" | "restoring" | "removed";
type PieceMode = "falling" | "restoring";

interface TodoItem {
  id: string;
  text: string;
  status: TodoStatus;
}

interface Piece {
  id: string;
  todoId: string;
  char: string;
  w: number;
  h: number;
  body?: Matter.Body; // present while it is simulated
  released: boolean; // false while hovering weightless before the drop
  releaseAt: number; // ms timestamp when gravity takes over
  mode: PieceMode;
  // last synced top-left / rotation
  x: number;
  y: number;
  rot: number;
  // restore (spring-home) state
  target?: { x: number; y: number }; // home top-left
  phase?: "wait" | "flight";
  liftAt?: number; // when this letter lifts out of the pile
  tweenStart?: number;
  rsx?: number;
  rsy?: number;
  rrot0?: number;
}

const INITIAL_TODOS: TodoItem[] = [
  { id: "ship", text: "Ship the thing", status: "active" },
  {
    id: "article",
    text: "Read the article I've had open in a tab since last month",
    status: "active",
  },
  {
    id: "email",
    text: "Reply to the email I keep dodging",
    status: "active",
  },
];

const FONT = "600 17px Inter";
const LINE_HEIGHT = 26;
const LAYOUT_WIDTH = 430;

const WALL = 80; // static wall thickness

// recall (gentle rise) tuning
const LIFT_STAGGER = 34; // ms between letters lifting out of the pile
const RESTORE_DUR = 560; // how long one letter takes to glide home
const RISE_ARC = 14; // px of upward bow so it curves rather than slides straight

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function PretextReflowLab() {
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [renderIds, setRenderIds] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [fontsReady, setFontsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<Map<string, HTMLElement>>(new Map());
  const piecesRef = useRef<Map<string, Piece>>(new Map());
  const elsRef = useRef<Map<string, HTMLSpanElement>>(new Map());
  const engineRef = useRef<Matter.Engine | null>(null);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        if (!cancelled) setFontsReady(true);
      });
    } else {
      setFontsReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach(window.clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }
    },
    [],
  );

  const visibleTodos = todos.filter((t) => t.status !== "removed");
  const nextUndoId = undoStack.at(-1);

  const layouts = useMemo(() => {
    return Object.fromEntries(
      todos.map((todo) => {
        const prepared = prepareWithSegments(todo.text, FONT, {
          whiteSpace: "pre-wrap",
        });
        return [todo.id, layoutWithLines(prepared, LAYOUT_WIDTH, LINE_HEIGHT)];
      }),
    );
  }, [todos, fontsReady]);

  // ── engine ───────────────────────────────────────────────────────
  function ensureEngine() {
    if (engineRef.current) return engineRef.current;
    const c = containerRef.current;
    if (!c) return null;
    const W = c.clientWidth;
    const H = c.clientHeight;
    const engine = Matter.Engine.create({ enableSleeping: true });
    engine.gravity.y = 0.68; // softer pull — letters drift down rather than plummet
    Matter.Composite.add(engine.world, [
      Matter.Bodies.rectangle(W / 2, H + WALL / 2, W + 2 * WALL, WALL, {
        isStatic: true,
      }),
      Matter.Bodies.rectangle(-WALL / 2, H / 2, WALL, H * 3, { isStatic: true }),
      Matter.Bodies.rectangle(W + WALL / 2, H / 2, WALL, H * 3, {
        isStatic: true,
      }),
    ]);
    engineRef.current = engine;
    return engine;
  }

  function ensureLoop() {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(frame);
  }

  function applyTransform(p: Piece) {
    const el = elsRef.current.get(p.id);
    if (el)
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
  }

  function syncFromBody(p: Piece, b: Matter.Body) {
    p.x = b.position.x - p.w / 2;
    p.y = b.position.y - p.h / 2;
    p.rot = (b.angle * 180) / Math.PI;
    applyTransform(p);
  }

  // one frame of a letter rising out of the pile and gliding home (no physics)
  function restoreStep(p: Piece, now: number, engine: Matter.Engine | null) {
    const t = p.target;
    if (!t) return;

    // still resting in the pile, waiting its turn to lift out
    if (p.phase === "wait") {
      if (p.body && now < (p.liftAt ?? now)) {
        syncFromBody(p, p.body);
        return;
      }
      // hand off from physics to the gentle tween
      if (p.body && engine) {
        Matter.Composite.remove(engine.world, p.body);
        // let the rest of the pile settle into the gap left behind
        Matter.Composite.allBodies(engine.world).forEach((x) => {
          if (!x.isStatic) Matter.Sleeping.set(x, false);
        });
      }
      p.body = undefined;
      p.phase = "flight";
      p.tweenStart = now;
      p.rsx = p.x;
      p.rsy = p.y;
      p.rrot0 = p.rot;
    }

    const e = easeInOut(
      Math.min(1, (now - (p.tweenStart ?? now)) / RESTORE_DUR),
    );
    p.x = lerp(p.rsx ?? p.x, t.x, e);
    p.y = lerp(p.rsy ?? p.y, t.y, e) - Math.sin(Math.PI * e) * RISE_ARC;
    p.rot = lerp(p.rrot0 ?? p.rot, 0, e);
    applyTransform(p);
  }

  function frame() {
    const engine = engineRef.current;
    if (engine) Matter.Engine.update(engine, 1000 / 60);
    const now = performance.now();
    let active = false;

    piecesRef.current.forEach((p) => {
      if (p.mode === "restoring") {
        active = true;
        restoreStep(p, now, engine);
        return;
      }

      const b = p.body;
      if (!b) return;

      // still hovering weightless at its home spot until release time
      if (!p.released) {
        active = true;
        if (now >= p.releaseAt && engine) {
          Matter.Body.setVelocity(b, {
            x: (Math.random() - 0.5) * 0.7,
            y: Math.random() * 0.4, // barely moving — gravity eases it down
          });
          Matter.Composite.add(engine.world, b);
          p.released = true;
        } else {
          applyTransform(p); // frozen in place = weightless
          return;
        }
      }

      p.x = b.position.x - p.w / 2;
      p.y = b.position.y - p.h / 2;
      p.rot = (b.angle * 180) / Math.PI;
      applyTransform(p);
      if (!b.isSleeping) active = true;
    });

    rafRef.current = active ? requestAnimationFrame(frame) : null;
  }

  // measure real glyph rects (skip whitespace), relative to the container
  function measureChars(textEl: HTMLElement, crect: DOMRect) {
    const node = textEl.firstChild;
    if (!node) return [];
    const text = node.textContent ?? "";
    const range = document.createRange();
    const out: { char: string; x: number; y: number; w: number; h: number }[] =
      [];
    for (let i = 0; i < text.length; i++) {
      if (text[i].trim() === "") continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      out.push({
        char: text[i],
        x: r.left - crect.left,
        y: r.top - crect.top,
        w: r.width,
        h: r.height,
      });
    }
    return out;
  }

  // ── actions ──────────────────────────────────────────────────────
  function markDone(id: string) {
    const todo = todos.find((t) => t.id === id);
    const textEl = textRefs.current.get(id);
    const c = containerRef.current;
    if (!todo || todo.status !== "active" || !textEl || !c) return;

    const engine = ensureEngine();
    if (!engine) return;

    const crect = c.getBoundingClientRect();
    const chars = measureChars(textEl, crect);
    if (chars.length === 0) return;

    const now = performance.now();
    const newIds: string[] = [];
    chars.forEach((ch, i) => {
      const pid = `${id}-${i}`;
      const body = Matter.Bodies.rectangle(
        ch.x + ch.w / 2,
        ch.y + ch.h / 2,
        ch.w,
        Math.max(ch.h * 0.72, 12), // tighten the collision box to the glyph
        { restitution: 0.1, friction: 0.6, frictionAir: 0.02, chamfer: { radius: 2 } },
      );
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
      // NB: added to the world later (see frame) so it can hover first
      piecesRef.current.set(pid, {
        id: pid,
        todoId: id,
        char: ch.char,
        w: ch.w,
        h: ch.h,
        body,
        released: false,
        // scattered let-go: a light reading-order bias + randomness so some
        // letters drop first and others hang a beat longer
        releaseAt: now + i * 12 + Math.random() * 380,
        mode: "falling",
        x: ch.x,
        y: ch.y,
        rot: 0,
      });
      newIds.push(pid);
    });

    setRenderIds((ids) => [...ids, ...newIds]);
    setTodos((items) =>
      items.map((it) => (it.id === id ? { ...it, status: "falling" } : it)),
    );
    setUndoStack((s) => [...s.filter((x) => x !== id), id]);
    ensureLoop();

    const collapse = window.setTimeout(() => {
      setTodos((items) =>
        items.map((it) =>
          it.id === id && it.status === "falling"
            ? { ...it, status: "removed" }
            : it,
        ),
      );
    }, 420);
    timersRef.current.push(collapse);
  }

  function undoLast() {
    const id = undoStack.at(-1);
    if (!id) return;
    setUndoStack((s) => s.slice(0, -1));

    const engine = engineRef.current;
    // keep the bodies in the world — the spring flight is real physics and
    // needs them to collide with (and shove) the rest of the pile
    piecesRef.current.forEach((p) => {
      if (p.todoId !== id) return;
      p.mode = "restoring";
      p.phase = undefined; // wait → flight → snap, set up once the row is back
      p.target = undefined; // (re)measured once the row is back in the DOM
    });

    // wake everything so the pile reacts to the letters lifting out
    if (engine)
      Matter.Composite.allBodies(engine.world).forEach((b) => {
        if (!b.isStatic) Matter.Sleeping.set(b, false);
      });

    setTodos((items) =>
      items.map((it) => (it.id === id ? { ...it, status: "restoring" } : it)),
    );

    const count = [...piecesRef.current.values()].filter(
      (p) => p.todoId === id,
    ).length;
    // worst case: last letter lifts, then glides the full duration home
    const dur = count * LIFT_STAGGER + RESTORE_DUR + 140;

    const finish = window.setTimeout(() => {
      setTodos((items) =>
        items.map((it) =>
          it.id === id && it.status === "restoring"
            ? { ...it, status: "active" }
            : it,
        ),
      );
      piecesRef.current.forEach((p, k) => {
        if (p.todoId !== id) return;
        if (engine && p.body) Matter.Composite.remove(engine.world, p.body);
        piecesRef.current.delete(k);
        elsRef.current.delete(k);
      });
      setRenderIds((ids) => ids.filter((pid) => piecesRef.current.has(pid)));
    }, dur);
    timersRef.current.push(finish);
  }

  // once a restoring row is back in the DOM, aim each letter at its real slot
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const crect = c.getBoundingClientRect();
    let started = false;

    todos.forEach((t) => {
      if (t.status !== "restoring") return;
      const textEl = textRefs.current.get(t.id);
      if (!textEl) return;
      const pieces = [...piecesRef.current.values()].filter(
        (p) => p.todoId === t.id && !p.target,
      );
      if (pieces.length === 0) return;
      const homes = measureChars(textEl, crect);
      const now = performance.now();
      // peel letters out of the pile in a scattered order, not left-to-right
      const order = pieces.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      pieces.forEach((p, i) => {
        const home = homes[i] ?? homes[homes.length - 1] ?? { x: p.x, y: p.y };
        p.mode = "restoring";
        p.target = { x: home.x, y: home.y };
        p.phase = "wait";
        p.liftAt = now + order[i] * LIFT_STAGGER;
        started = true;
      });
    });

    if (started) ensureLoop();
  }, [todos]);

  function resetTodos() {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      engineRef.current = null;
    }
    piecesRef.current.clear();
    elsRef.current.clear();
    setRenderIds([]);
    setUndoStack([]);
    setTodos(INITIAL_TODOS);
  }

  // ── render ───────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative h-[440px] overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--line)",
        background: "color-mix(in srgb, var(--foreground) 3%, transparent)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "var(--line)" }}
      />

      {/* simulated / piled letters live behind the content */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {renderIds.map((pid) => {
          const p = piecesRef.current.get(pid);
          if (!p) return null;
          return (
            <span
              key={pid}
              ref={(el) => {
                if (el) {
                  elsRef.current.set(pid, el);
                  const cur = piecesRef.current.get(pid);
                  if (cur)
                    el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) rotate(${cur.rot}deg)`;
                } else {
                  elsRef.current.delete(pid);
                }
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                font: FONT,
                lineHeight: 1,
                color: "var(--foreground)",
                opacity: 0.85,
                willChange: "transform",
              }}
            >
              {p.char}
            </span>
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col gap-5 p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              Gravity todo
            </p>
            <h3
              className="mt-1 text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Check it off, let it fall.
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={undoLast}
              disabled={!nextUndoId}
              className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-40"
              style={{
                borderColor: nextUndoId ? "var(--accent)" : "var(--line)",
                color: nextUndoId ? "var(--accent)" : "var(--muted)",
              }}
            >
              Undo
            </button>
            <button
              type="button"
              onClick={resetTodos}
              className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              Reset
            </button>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[30rem] flex-col">
          {visibleTodos.map((todo) => {
            const layout = layouts[todo.id];
            return (
              <TodoRow
                key={todo.id}
                todo={todo}
                height={layout?.height ?? LINE_HEIGHT}
                onDone={() => markDone(todo.id)}
                registerText={(el) => {
                  if (el) textRefs.current.set(todo.id, el);
                  else textRefs.current.delete(todo.id);
                }}
              />
            );
          })}

          {visibleTodos.length === 0 && (
            <div
              className="py-10 text-center text-sm"
              style={{ color: "var(--muted)" }}
            >
              All done — nothing left to drop.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TodoRow({
  todo,
  height,
  onDone,
  registerText,
}: {
  todo: TodoItem;
  height: number;
  onDone: () => void;
  registerText: (el: HTMLElement | null) => void;
}) {
  const collapsing = todo.status === "falling";
  const textHidden = todo.status !== "active";
  const isActive = todo.status === "active";
  const rowMax = Math.max(64, height + 34);

  return (
    <div
      style={{
        maxHeight: collapsing ? 0 : rowMax,
        opacity: collapsing ? 0 : 1,
        marginBottom: collapsing ? 0 : 10,
        overflow: "hidden",
        transition:
          "max-height 400ms ease, opacity 260ms ease, margin-bottom 400ms ease",
      }}
    >
      <button
        type="button"
        onClick={onDone}
        disabled={!isActive}
        aria-label={`Mark "${todo.text}" done`}
        className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
          isActive ? "cursor-pointer hover:border-[color:var(--accent)]" : ""
        }`}
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
        }}
      >
        <span
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition group-hover:bg-[color:var(--accent)] group-hover:text-[color:var(--background)]"
          style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
        >
          {isActive ? (
            <span className="opacity-0 transition group-hover:opacity-100">
              ✓
            </span>
          ) : (
            "✓"
          )}
        </span>

        <span
          ref={registerText}
          className="min-w-0 flex-1 self-center"
          style={{
            font: FONT,
            lineHeight: `${LINE_HEIGHT}px`,
            color: "var(--foreground)",
            minHeight: height,
            maxWidth: LAYOUT_WIDTH,
            opacity: textHidden ? 0 : 1,
          }}
        >
          {todo.text}
        </span>
      </button>
    </div>
  );
}
