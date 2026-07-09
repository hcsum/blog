"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Mini Planet
 * -----------
 * A procedural low-poly planet: an icosphere displaced into hills, a shell of
 * translucent water, a scatter of cone-trees and a couple of drifting clouds.
 * Flat-shaded for the faceted look. Everything is generated in code — no
 * textures, no models — so it stays light. Drag to orbit, it auto-rotates.
 */

// cheap deterministic 3D pseudo-noise (no deps) → gentle rolling terrain
function terrain(x: number, y: number, z: number) {
  const n =
    Math.sin(x * 1.5 + y * 2.1) +
    Math.sin(y * 1.7 + z * 1.9) * 0.8 +
    Math.sin(z * 2.3 + x * 1.3) * 0.6 +
    Math.sin((x + y + z) * 3.1) * 0.35;
  return (n + 2.75) / 5.5; // roughly 0..1
}

// site palette-ish terrain ramp: sand → teal-green → deep pine
const SAND = new THREE.Color("#e4d6b0");
const GRASS = new THREE.Color("#3fae86");
const PINE = new THREE.Color("#1f6f57");

export default function MiniPlanet() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const width = wrap.clientWidth || 800;
    const height = wrap.clientHeight || 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 6.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 11;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.7;

    // group we gently bob up and down
    const world = new THREE.Group();
    scene.add(world);

    // ---- planet ----
    const RADIUS = 1.7;
    const planetGeo = new THREE.IcosahedronGeometry(RADIUS, 12);
    const pos = planetGeo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const dir = v.clone().normalize();
      const e = terrain(dir.x * 2.2, dir.y * 2.2, dir.z * 2.2);
      // only push land up (above sea level), keep lowlands near base radius
      const lift = Math.max(0, e - 0.42) * 0.9;
      const r = RADIUS * (1 + lift * 0.26);
      v.copy(dir).multiplyScalar(r);
      pos.setXYZ(i, v.x, v.y, v.z);

      const t = THREE.MathUtils.clamp((e - 0.42) / 0.5, 0, 1);
      if (t < 0.35) c.copy(SAND).lerp(GRASS, t / 0.35);
      else c.copy(GRASS).lerp(PINE, (t - 0.35) / 0.65);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    planetGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    planetGeo.computeVertexNormals();
    const planet = new THREE.Mesh(
      planetGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.95,
        metalness: 0,
      }),
    );
    planet.castShadow = true;
    planet.receiveShadow = true;
    world.add(planet);

    // ---- water shell ----
    const water = new THREE.Mesh(
      new THREE.IcosahedronGeometry(RADIUS * 1.045, 8),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2fb6d6"),
        flatShading: true,
        transparent: true,
        opacity: 0.72,
        roughness: 0.25,
        metalness: 0.1,
      }),
    );
    world.add(water);

    // ---- trees, planted on the high ground ----
    const treeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2c8f6b"),
      flatShading: true,
      roughness: 1,
    });
    const trunkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#7a563a"),
      flatShading: true,
      roughness: 1,
    });
    const up = new THREE.Vector3(0, 1, 0);
    let planted = 0;
    let attempts = 0;
    while (planted < 14 && attempts < 400) {
      attempts++;
      const dir = new THREE.Vector3()
        .randomDirection()
        .normalize();
      const e = terrain(dir.x * 2.2, dir.y * 2.2, dir.z * 2.2);
      if (e < 0.6) continue; // only on hills
      const lift = Math.max(0, e - 0.42) * 0.9;
      const surface = RADIUS * (1 + lift * 0.26);

      const tree = new THREE.Group();
      const s = 0.12 + Math.random() * 0.06;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(s * 0.28, s * 0.34, s * 1.6, 5),
        trunkMat,
      );
      trunk.position.y = s * 0.8;
      const crownLow = new THREE.Mesh(
        new THREE.ConeGeometry(s * 1.1, s * 1.9, 6),
        treeMat,
      );
      crownLow.position.y = s * 2.1;
      const crownTop = new THREE.Mesh(
        new THREE.ConeGeometry(s * 0.8, s * 1.5, 6),
        treeMat,
      );
      crownTop.position.y = s * 3.0;
      tree.add(trunk, crownLow, crownTop);

      tree.position.copy(dir).multiplyScalar(surface - s * 0.2);
      tree.quaternion.setFromUnitVectors(up, dir);
      world.add(tree);
      planted++;
    }

    // ---- clouds ----
    const cloudMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f4f8ff"),
      flatShading: true,
      roughness: 1,
      transparent: true,
      opacity: 0.9,
    });
    const clouds = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const cloud = new THREE.Group();
      const blobs = 3 + Math.floor(Math.random() * 2);
      for (let b = 0; b < blobs; b++) {
        const puff = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.22 + Math.random() * 0.14, 1),
          cloudMat,
        );
        puff.position.set(
          (b - blobs / 2) * 0.28,
          Math.random() * 0.08,
          Math.random() * 0.1,
        );
        cloud.add(puff);
      }
      const dir = new THREE.Vector3().randomDirection();
      cloud.position.copy(dir).multiplyScalar(RADIUS * 1.55);
      cloud.lookAt(0, 0, 0);
      cloud.userData.spin = 0.05 + Math.random() * 0.08;
      cloud.userData.axis = new THREE.Vector3().randomDirection();
      clouds.add(cloud);
    }
    world.add(clouds);

    // ---- lights ----
    const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
    key.position.set(4, 6, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88bbff, 0.5);
    fill.position.set(-5, -2, -3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0x8899bb, 0.55));

    // ---- loop ----
    const clock = new THREE.Clock();
    let frameId = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      world.position.y = Math.sin(t * 0.8) * 0.08;
      clouds.children.forEach((cl) => {
        cl.rotateOnAxis(cl.userData.axis, cl.userData.spin * 0.01);
      });
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    // ---- resize ----
    const resize = () => {
      const w = wrap.clientWidth || width;
      const h = wrap.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-[1.75rem]"
      style={{
        height: "min(62vh, 540px)",
        background:
          "radial-gradient(circle at 50% 30%, rgba(56,189,248,0.14), transparent 62%), radial-gradient(circle at 72% 82%, rgba(167,139,250,0.12), transparent 55%)",
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-[0.62rem] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--muted)", opacity: 0.75 }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        Drag to orbit
      </div>
    </div>
  );
}
