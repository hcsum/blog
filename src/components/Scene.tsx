"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experience } from "./Experience";

function addStars(scene: THREE.Scene) {
  const starGeometry = new THREE.SphereGeometry(0.05, 4, 4); // Reduced segments further
  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1,
  });

  const matrix = new THREE.Matrix4();
  const instancedMesh = new THREE.InstancedMesh(
    starGeometry,
    starMaterial,
    1000,
  );

  for (let i = 0; i < 1000; i++) {
    matrix.setPosition(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
    );
    instancedMesh.setMatrixAt(i, matrix);
  }

  scene.add(instancedMesh);
}

function addCube(scene: THREE.Scene, textureLoader: THREE.TextureLoader) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load("/images/me.png"),
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  return cube;
}

function addDoughnut(scene: THREE.Scene) {
  const torus = new THREE.TorusGeometry(4, 0.2, 16, 100);
  const doughnut = new THREE.Mesh(
    torus,
    new THREE.MeshStandardMaterial({ color: 0xff6633 }),
  );
  doughnut.position.set(1, 0, 0);
  doughnut.rotation.x = Math.PI / 4;
  doughnut.rotation.z = Math.PI / 6;
  scene.add(doughnut);
  return doughnut;
}

function addExperienceCard(scene: THREE.Scene) {
  const INITIAL_CARD_Y_POSITION = -5; // Starting Y position for the first card
  const CARD_SPACING = 3; // Vertical space between cards (2 + 1 from original calculation)
  const CARD_X_OFFSET = 0.5; // How far cards are offset horizontally

  const geometry = new THREE.PlaneGeometry(4, 2);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    wireframe: false,
  });
  const edges = new THREE.EdgesGeometry(geometry);
  const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  const cardGroups: THREE.Group[] = []; // Array to store card groups

  experience.forEach((exp, index) => {
    const plane = new THREE.Mesh(geometry, material);

    // Create border using EdgesGeometry and LineSegments
    const border = new THREE.LineSegments(edges, borderMaterial);

    // Group the plane and border together
    const cardGroup = new THREE.Group();
    cardGroup.add(plane);
    cardGroup.add(border);

    // Calculate position with named constants
    const yOffset = INITIAL_CARD_Y_POSITION - CARD_SPACING * index;
    const xOffset = index % 2 === 0 ? -CARD_X_OFFSET : CARD_X_OFFSET;
    cardGroup.position.set(xOffset, yOffset, 0);

    // Alternate tilt
    cardGroup.rotation.y = index % 2 === 0 ? Math.PI / 12 : -Math.PI / 12;

    // Add card group to our array
    cardGroups.push(cardGroup);
    scene.add(cardGroup);
  });

  return cardGroups; // Return the array of card groups
}

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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentMount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    const cube = addCube(scene, textureLoader);
    const doughnut = addDoughnut(scene);
    const cards = addExperienceCard(scene); // Store reference to cards
    addStars(scene);

    const pointLight = new THREE.PointLight(0xffffff, 4, 100);
    pointLight.position.set(5, 0, 0);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // const cameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
    // const gridHelper = new THREE.GridHelper(200, 50);
    // const lightHelper = new THREE.PointLightHelper(pointLight);
    // scene.add(cameraHelper, gridHelper, lightHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enableDamping = true;

    camera.position.z = 5;
    const initialCameraY = camera.position.y;

    // Replace handleScroll with this updated version
    const handleScroll = () => {
      const scrollPercent = window.scrollY / window.innerHeight;
      const targetY = initialCameraY - scrollPercent * 10;

      // Add camera rotation based on scroll
      const rotationX = scrollPercent * 0.5; // Adjust this multiplier to control tilt sensitivity
      camera.position.y = targetY;
      camera.rotation.x = rotationX;

      // Update controls target to maintain proper orbiting
      controls.target.y = targetY;
      controls.update();
    };

    // Replace event listeners
    window.addEventListener("scroll", handleScroll);

    // Add resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Use clock for consistent animations
    const clock = new THREE.Clock();
    let angle = 0;

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      // Update animations based on time delta
      cube.rotation.x += 0.5 * delta;
      cube.rotation.y += 0.5 * delta;

      doughnut.rotation.x += 0.05 * delta;
      doughnut.rotation.y += 0.025 * delta;

      // Reset angle when it completes a full circle (2π)
      angle = (angle + delta) % (Math.PI * 2);

      cards.forEach((card, index) => {
        const baseAngle = Math.PI / 12;
        const phaseOffset = (index * Math.PI) / 3;
        const oscillation = Math.sin(angle * 2 + phaseOffset) * 0.1;
        card.rotation.y =
          (index % 2 === 0 ? baseAngle : -baseAngle) + oscillation;
      });

      renderer.render(scene, camera);
      controls.update();
    });

    // Update cleanup
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
      className="w-full min-h-full fixed top-0 left-0 z-[-1] h-[300vh]"
    ></div>
  );
}
