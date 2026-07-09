"use client";

import { useCallback, useRef, useState } from "react";

/**
 * A pure-DOM/CSS frontend toy: a card that tilts in 3D toward the pointer,
 * with a specular glare that tracks the cursor. No WebGL, no libraries —
 * just perspective transforms and a radial-gradient highlight.
 */
export default function TiltCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  // rotX / rotY in degrees, glare position in %.
  const [style, setStyle] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const MAX_TILT = 14;

  const onMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0..1
    const py = (event.clientY - rect.top) / rect.height; // 0..1
    setStyle({
      ry: (px - 0.5) * 2 * MAX_TILT,
      rx: -(py - 0.5) * 2 * MAX_TILT,
      gx: px * 100,
      gy: py * 100,
    });
  }, []);

  const reset = useCallback(() => {
    setActive(false);
    setStyle({ rx: 0, ry: 0, gx: 50, gy: 50 });
  }, []);

  return (
    <div
      className="flex min-h-[560px] w-full items-center justify-center"
      style={{ perspective: "1100px" }}
    >
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={reset}
        className="relative aspect-[7/9] w-[19rem] max-w-[80vw] cursor-none rounded-[1.75rem] p-7 will-change-transform sm:w-[21rem]"
        style={{
          transform: `rotateX(${style.rx}deg) rotateY(${style.ry}deg) scale(${active ? 1.04 : 1})`,
          transformStyle: "preserve-3d",
          transition: active
            ? "transform 90ms ease-out"
            : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          background:
            "linear-gradient(150deg, rgba(94,234,212,0.22), rgba(56,189,248,0.14) 45%, rgba(167,139,250,0.2))",
          border: "1px solid var(--line)",
          boxShadow: active
            ? "0 40px 90px rgba(2,6,23,0.45)"
            : "0 24px 60px rgba(2,6,23,0.3)",
        }}
      >
        {/* Specular glare that follows the pointer */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
          style={{
            background: `radial-gradient(circle at ${style.gx}% ${style.gy}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%)`,
            opacity: active ? 0.85 : 0,
            transition: "opacity 240ms ease",
            mixBlendMode: "soft-light",
          }}
        />

        {/* Floating content layers — pushed forward in 3D for parallax depth */}
        <div
          className="relative flex h-full flex-col justify-between"
          style={{ transform: "translateZ(46px)", transformStyle: "preserve-3d" }}
        >
          <div>
            <p
              className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              CSS · Pointer
            </p>
            <h3
              className="mt-3 text-2xl font-semibold leading-tight"
              style={{ color: "var(--foreground)", transform: "translateZ(24px)" }}
            >
              Perspective tilt
              <br />
              with live glare
            </h3>
          </div>

          <p
            className="text-sm leading-6"
            style={{ color: "var(--muted)" }}
          >
            No canvas, no WebGL — just a perspective transform driven by the
            pointer and a radial highlight tracking your cursor. Move around,
            leave to let it settle back.
          </p>
        </div>
      </div>
    </div>
  );
}
