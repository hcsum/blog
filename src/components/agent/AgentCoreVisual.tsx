"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  getStatusChipLabel,
  getToneMeta,
  normalizeStatus,
  type AgentStatusTone,
} from "@/lib/agent-status";

type AgentCoreVisualProps = {
  title?: string;
  summary?: string;
  status: string;
  tone: AgentStatusTone;
  isStale: boolean;
};

type VisualState = {
  pulseSpeed: number;
  wobble: number;
  shellOpacity: number;
  ringSpeed: number;
  particleDrift: number;
  accent: string;
  secondary: string;
};

const toneFallbacks: Record<AgentStatusTone, string> = {
  idle: "#67e8f9",
  active: "#a3e635",
  researching: "#2dd4bf",
  drafting: "#fbbf24",
  knowledge: "#5eead4",
  deployment: "#a78bfa",
  failed: "#fb7185",
  unavailable: "#94a3b8",
};

export default function AgentCoreVisual({
  title,
  summary,
  status,
  tone,
  isStale,
}: AgentCoreVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef(normalizeStatus(status));
  const visualStateRef = useRef<VisualState>({
    pulseSpeed: 0.7,
    wobble: 0.04,
    shellOpacity: 0.18,
    ringSpeed: 0.18,
    particleDrift: 0.16,
    accent: toneFallbacks.idle,
    secondary: "#e2e8f0",
  });

  useEffect(() => {
    statusRef.current = normalizeStatus(status);
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.4, 6.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      canvas,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    const keyLight = new THREE.PointLight(0xffffff, 16, 0, 2);
    keyLight.position.set(2.5, 3, 5);
    const rimLight = new THREE.PointLight(0x5eead4, 10, 0, 2);
    rimLight.position.set(-4, -2, -3);
    scene.add(ambientLight, keyLight, rimLight);

    const coreGeometry = new THREE.IcosahedronGeometry(1.45, isMobile ? 2 : 3);
    const shellGeometry = new THREE.IcosahedronGeometry(2.05, isMobile ? 1 : 2);
    const innerCoreGeometry = new THREE.SphereGeometry(
      0.78,
      isMobile ? 18 : 26,
      isMobile ? 18 : 26,
    );
    const ringGeometry = new THREE.TorusGeometry(2.5, 0.035, 16, 120);
    const ringGeometrySecondary = new THREE.TorusGeometry(1.9, 0.025, 16, 96);

    const coreMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#67e8f9"),
      emissive: new THREE.Color("#67e8f9"),
      emissiveIntensity: 0.72,
      shininess: 90,
      transparent: true,
      opacity: 0.94,
      flatShading: false,
    });
    const innerCoreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ecfeff"),
      transparent: true,
      opacity: 0.92,
    });
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#67e8f9"),
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    });
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#67e8f9"),
      transparent: true,
      opacity: 0.7,
    });
    const ringMaterialSecondary = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ecfeff"),
      transparent: true,
      opacity: 0.24,
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    const ringPrimary = new THREE.Mesh(ringGeometry, ringMaterial);
    ringPrimary.rotation.x = Math.PI / 2.7;
    const ringSecondary = new THREE.Mesh(
      ringGeometrySecondary,
      ringMaterialSecondary,
    );
    ringSecondary.rotation.set(Math.PI / 1.8, 0.4, 0.2);

    const root = new THREE.Group();
    root.add(core, innerCore, shell, ringPrimary, ringSecondary);
    scene.add(root);

    const particleCount = isMobile ? 70 : 150;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 3 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#d9f99d"),
      size: isMobile ? 0.048 : 0.04,
      transparent: true,
      opacity: 0.82,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const position = coreGeometry.attributes.position;
    const basePositions = Float32Array.from(
      position.array as ArrayLike<number>,
    );
    const baseNormals = Float32Array.from(position.array as ArrayLike<number>);
    for (let i = 0; i < baseNormals.length; i += 3) {
      const vector = new THREE.Vector3(
        baseNormals[i],
        baseNormals[i + 1],
        baseNormals[i + 2],
      ).normalize();
      baseNormals[i] = vector.x;
      baseNormals[i + 1] = vector.y;
      baseNormals[i + 2] = vector.z;
    }

    const size = { width: 0, height: 0 };
    const resize = () => {
      size.width = container.clientWidth;
      size.height = container.clientHeight || size.width;
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height, false);
    };
    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      const state = visualStateRef.current;
      const elapsed = clock.getElapsedTime();
      const pulse = reducedMotion
        ? 0.25
        : Math.sin(elapsed * state.pulseSpeed) * 0.5 + 0.5;
      const flash =
        statusRef.current === "deployment"
          ? Math.sin(elapsed * 4.2) * 0.5 + 0.5
          : 0;
      const fracture =
        statusRef.current === "failed"
          ? Math.sin(elapsed * 2.8) * 0.5 + 0.5
          : 0;
      const wobble = reducedMotion ? state.wobble * 0.35 : state.wobble;
      const positions = position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const vertexIndex = i / 3;
        const wave =
          Math.sin(
            elapsed * state.pulseSpeed +
              vertexIndex * 0.16 +
              baseNormals[i] * 2.4,
          ) *
            wobble +
          Math.cos(
            elapsed * (state.pulseSpeed * 0.55) + baseNormals[i + 1] * 3.6,
          ) *
            wobble *
            0.55;
        const tension = wave + flash * 0.08 - fracture * 0.05;
        positions[i] = basePositions[i] + baseNormals[i] * tension;
        positions[i + 1] = basePositions[i + 1] + baseNormals[i + 1] * tension;
        positions[i + 2] = basePositions[i + 2] + baseNormals[i + 2] * tension;
      }

      position.needsUpdate = true;
      coreGeometry.computeVertexNormals();

      root.rotation.y += reducedMotion ? 0.0016 : state.ringSpeed * 0.01;
      root.rotation.z = Math.sin(elapsed * 0.22) * 0.16;
      core.rotation.x += 0.0024;
      shell.rotation.x -= 0.0014;
      ringPrimary.rotation.z += state.ringSpeed * 0.012;
      ringSecondary.rotation.y -= state.ringSpeed * 0.009;
      particles.rotation.y += state.particleDrift * 0.003;
      particles.rotation.x = Math.sin(elapsed * 0.28) * 0.12;

      const accent = new THREE.Color(state.accent);
      const secondary = new THREE.Color(state.secondary);
      coreMaterial.color.lerp(accent, 0.1);
      coreMaterial.emissive.lerp(accent, 0.1);
      innerCoreMaterial.color.lerp(secondary, 0.08);
      shellMaterial.color.lerp(accent, 0.08);
      ringMaterial.color.lerp(accent, 0.08);
      ringMaterialSecondary.color.lerp(secondary, 0.08);
      particleMaterial.color.lerp(accent, 0.05);

      coreMaterial.emissiveIntensity = 0.5 + pulse * 1.25 + flash * 0.8;
      shellMaterial.opacity =
        state.shellOpacity + pulse * 0.08 + fracture * 0.06;
      innerCore.scale.setScalar(0.92 + pulse * 0.22 + flash * 0.08);
      core.scale.setScalar(
        0.98 + pulse * 0.16 + flash * 0.05 - fracture * 0.04,
      );

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      coreGeometry.dispose();
      shellGeometry.dispose();
      innerCoreGeometry.dispose();
      ringGeometry.dispose();
      ringGeometrySecondary.dispose();
      particleGeometry.dispose();
      coreMaterial.dispose();
      innerCoreMaterial.dispose();
      shellMaterial.dispose();
      ringMaterial.dispose();
      ringMaterialSecondary.dispose();
      particleMaterial.dispose();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    const meta = getToneMeta(tone);
    const normalized = normalizeStatus(status);

    switch (normalized) {
      case "deployment":
        visualStateRef.current = {
          pulseSpeed: 1.7,
          wobble: 0.08,
          shellOpacity: 0.2,
          ringSpeed: 0.52,
          particleDrift: 0.42,
          accent: meta.accent,
          secondary: "#d8b4fe",
        };
        break;
      case "researching":
        visualStateRef.current = {
          pulseSpeed: 1.2,
          wobble: 0.1,
          shellOpacity: 0.22,
          ringSpeed: 0.4,
          particleDrift: 0.36,
          accent: meta.accent,
          secondary: "#99f6e4",
        };
        break;
      case "drafting":
        visualStateRef.current = {
          pulseSpeed: 0.95,
          wobble: 0.055,
          shellOpacity: 0.17,
          ringSpeed: 0.24,
          particleDrift: 0.18,
          accent: meta.accent,
          secondary: "#fde68a",
        };
        break;
      case "knowledge":
        visualStateRef.current = {
          pulseSpeed: 0.86,
          wobble: 0.075,
          shellOpacity: 0.24,
          ringSpeed: 0.28,
          particleDrift: 0.24,
          accent: meta.accent,
          secondary: "#ccfbf1",
        };
        break;
      case "failed":
        visualStateRef.current = {
          pulseSpeed: 0.7,
          wobble: 0.12,
          shellOpacity: 0.1,
          ringSpeed: 0.14,
          particleDrift: 0.14,
          accent: meta.accent,
          secondary: "#fecdd3",
        };
        break;
      case "running":
      case "queued":
      case "received":
      case "completed":
      case "delivered":
        visualStateRef.current = {
          pulseSpeed: 1.08,
          wobble: 0.08,
          shellOpacity: 0.19,
          ringSpeed: 0.34,
          particleDrift: 0.3,
          accent: meta.accent,
          secondary: "#d9f99d",
        };
        break;
      case "idle":
        visualStateRef.current = {
          pulseSpeed: 0.58,
          wobble: isStale ? 0.025 : 0.038,
          shellOpacity: 0.14,
          ringSpeed: 0.15,
          particleDrift: 0.12,
          accent: isStale ? toneFallbacks.unavailable : meta.accent,
          secondary: "#e2e8f0",
        };
        break;
      default:
        visualStateRef.current = {
          pulseSpeed: 0.48,
          wobble: 0.022,
          shellOpacity: 0.1,
          ringSpeed: 0.1,
          particleDrift: 0.08,
          accent: toneFallbacks.unavailable,
          secondary: "#e2e8f0",
        };
    }
  }, [isStale, status, tone]);

  return (
    <section className="agent-panel agent-hero-panel rounded-[2rem] p-6 md:p-8">
      <div className="agent-scanline" />
      <div className="agent-info-popover">
        <button
          aria-label="About this agent"
          className="agent-info-popover__trigger"
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              fill="none"
              r="9"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M12 10.1v5.2M12 7.75h.01"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
        <div className="agent-info-popover__tooltip">
          <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
            This page shows the live status of my AI agent running on the cloud.
            I mostly interact with it through a Gmail bridge: I send it emails,
            it picks up tasks, runs them, and reports back. The event stream on
            the right is a public window into its recent activity.
          </p>
          <a
            className="mt-4 inline-flex text-sm font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline"
            href="https://github.com/hcsum/my-opencode-agent"
            rel="noreferrer"
            target="_blank"
          >
            View the repo on GitHub
          </a>
        </div>
      </div>
      <div className="relative flex min-h-[26rem] flex-col items-center justify-center gap-8 overflow-visible pt-4 md:pt-6">
        <div className="agent-core-wrap">
          <div className="agent-core-halo" />
          <div className="agent-core-ring" />
          <div className="agent-core-ring agent-core-ring--inner" />
          <div className="agent-core-stage mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-full md:max-w-[20rem]">
            <canvas className="h-full w-full" ref={canvasRef} />
          </div>
        </div>

        <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
          <div className="agent-hero-badge">
            <span className="agent-hero-badge__dot" />
            <span>Agent Status: {getStatusChipLabel(status)}</span>
          </div>
          <h1 className="agent-display mt-5 text-3xl font-bold tracking-[-0.03em] text-[color:var(--foreground)] md:text-5xl">
            {title ?? "Core synapse synchronized"}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[color:var(--muted)] md:text-base md:leading-8">
            {summary ??
              "The agent is alive, breathing, and continuously responding as new work enters its orbit."}
          </p>
        </div>
      </div>
    </section>
  );
}
