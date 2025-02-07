"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { addRing, addStars, addAstronaut } from "./add-stuff";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

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
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentMount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    addStars(scene);
    const { ring, cube } = addRing(scene, textureLoader);

    let astronaut: THREE.Mesh | null = null;
    let initialAstronautY = 0;
    const setupAstronaut = async () => {
      const mesh = await addAstronaut(scene, textureLoader);
      mesh.position.set(1, -6.5, 3);
      mesh.rotation.y = Math.PI / 2;
      astronaut = mesh;
      initialAstronautY = astronaut.rotation.y;
    };
    setupAstronaut();

    const pointLight = new THREE.PointLight(0xffffff, 100, 0);
    pointLight.position.set(-5, 0, 2);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // controls.dampingFactor = 0.25;

    let scrollPosY = 0;
    const handleScroll = () => {
      // const scrollPosY = (window.scrollY / window.innerHeight) * 0.3;
      scrollPosY = window.scrollY / document.body.clientHeight;
    };

    window.addEventListener("scroll", handleScroll);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    let ringAngle = 0;
    const delta = 0.01;
    const initialRingY = ring.position.y;
    const initialCameraY = camera.position.y;
    const focusThreshold = 0.55;

    const animate = () => {
      cube.rotation.x += 0.5 * delta;
      cube.rotation.y += 0.5 * delta;

      const oscillationAngle = Math.sin(ringAngle * 0.5) * (Math.PI / 4);
      ring.rotation.z += 0.2 * delta;
      ring.rotation.y = oscillationAngle;
      ring.position.y = initialRingY + scrollPosY * 10;
      ringAngle = (ringAngle + delta) % (Math.PI * 4);

      if (astronaut) {
        astronaut.rotation.y = initialAstronautY - Math.PI * scrollPosY;
      }
      if (scrollPosY > focusThreshold) {
        camera.position.y = initialCameraY - focusThreshold * 10;
      } else {
        camera.position.y = initialCameraY - scrollPosY * 10;
      }

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full fixed top-0 left-0 z-[-1]"
    ></div>
  );
}
