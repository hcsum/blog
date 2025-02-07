"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { debounce } from "lodash";
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
      mesh.position.set(1, -5, 3);
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
    controls.enableZoom = false;
    controls.enableDamping = true;

    const initialRingY = ring.position.y;
    const initialCameraY = camera.position.y;

    const handleScroll = () => {
      const scrollPosY = (window.scrollY / window.innerHeight) * 0.3;
      // const scrollPosY = window.scrollY / document.body.clientHeight;
      ring.position.y = initialRingY + scrollPosY * 10;

      if (astronaut) {
        astronaut.rotation.y = initialAstronautY - Math.PI * scrollPosY;
      }

      // Add camera rotation based on scroll
      const targetY = initialCameraY - scrollPosY * 10;
      camera.position.y = targetY;

      // Update controls target to maintain proper orbiting
      // controls.target.y = targetY;
      // controls.update();
    };

    window.addEventListener("scroll", handleScroll);

    const handleResize = debounce(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 1000);

    window.addEventListener("resize", handleResize);

    // Use clock for consistent animations
    const clock = new THREE.Clock();
    let ringAngle = 0;

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      cube.rotation.x += 0.5 * delta;
      cube.rotation.y += 0.5 * delta;

      const oscillationAngle = Math.sin(ringAngle * 0.5) * (Math.PI / 4);
      ring.rotation.z += 0.2 * delta;
      ring.rotation.y = oscillationAngle;
      ringAngle = (ringAngle + delta) % (Math.PI * 4);

      // card waving effect
      // cards.forEach((card, index) => {
      //   const baseAngle = Math.PI / 12;
      //   const phaseOffset = (index * Math.PI) / 3;
      //   const oscillation = Math.sin(cardAngle * 2 + phaseOffset) * 0.05;

      //   card.rotation.y =
      //     (index % 2 === 0 ? baseAngle : -baseAngle) + oscillation;
      // });
      // cardAngle = (cardAngle + delta) % (Math.PI * 2);

      renderer.render(scene, camera);
      controls.update();
    });

    return () => {
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full fixed top-0 left-0 z-[-1]"
    ></div>
  );
}
