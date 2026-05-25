"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { addRing, addStars, addAstronaut } from "./Scene/add-stuff";

export default function LandingScene() {
  useEffect(() => {
    const canvas = document.querySelector("#bg") as HTMLCanvasElement | null;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const textureLoader = new THREE.TextureLoader();
    addStars(scene);
    const { ring, cube } = addRing(scene, textureLoader);

    let astronaut: THREE.Mesh | null = null;
    let initialAstronautY = 0;

    const setupAstronaut = async () => {
      const mesh = await addAstronaut(scene, textureLoader);
      mesh.position.set(0.5, -6, 3);
      mesh.rotation.y = Math.PI / 2;
      astronaut = mesh;
      initialAstronautY = astronaut.rotation.y;
    };

    void setupAstronaut();

    const pointLight = new THREE.PointLight(0xffffff, 100, 0);
    pointLight.position.set(-5, 0, 2);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let scrollPosY = 0;
    const handleScroll = () => {
      scrollPosY = window.scrollY / Math.max(document.body.clientHeight, 1);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    let frame = 0;
    const initialRingY = ring.position.y;
    const initialCameraY = camera.position.y;
    const focusThreshold = 0.5;
    let animationFrameId = 0;

    const animate = () => {
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;

      const oscillationAngle = Math.sin(frame * 0.5) * (Math.PI / 4);
      ring.rotation.z += 0.002;
      ring.rotation.y = oscillationAngle;
      ring.position.y = initialRingY + scrollPosY * 5;
      ring.scale.setScalar(1 - scrollPosY * 1.5);
      frame = (frame + 0.01) % (Math.PI * 4);

      if (astronaut) {
        astronaut.rotation.y = initialAstronautY - Math.PI * scrollPosY;
      }

      camera.position.y =
        scrollPosY > focusThreshold
          ? initialCameraY - focusThreshold * 10
          : initialCameraY - scrollPosY * 10;

      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas id="bg" className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-80" />;
}
