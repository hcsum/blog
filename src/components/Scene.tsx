"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experience } from "./Experience";

import { Text } from "troika-three-text";

function addExperienceCard(scene: THREE.Scene) {
  const INITIAL_CARD_Y_POSITION = -5;
  const CARD_SPACING = 3;
  const CARD_X_OFFSET = 0.5;
  const CARD_WIDTH = 4;
  const CARD_HEIGHT = 2;
  const MARGIN = 0.2; // Margin from edges

  const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    wireframe: false,
  });
  const edges = new THREE.EdgesGeometry(geometry);
  const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  const cardGroups: THREE.Group[] = [];

  experience.forEach((exp, index) => {
    const plane = new THREE.Mesh(geometry, material);

    const leftEdge = -CARD_WIDTH / 2 + MARGIN; // Start from left edge + margin
    const topEdge = CARD_HEIGHT / 2 - MARGIN; // Start from top edge - margin
    const spacing = 0.3; // Vertical spacing between elements

    const titleMesh = new Text();
    titleMesh.text = exp.title;
    titleMesh.fontSize = 0.3;
    titleMesh.color = "white";
    titleMesh.position.set(leftEdge, topEdge, 0.1);
    titleMesh.anchorX = "left";
    titleMesh.maxWidth = CARD_WIDTH - MARGIN * 2;
    titleMesh.lineHeight = 1;
    titleMesh.overflowWrap = "break-word";
    titleMesh.sync();

    const companyMesh = new Text();
    companyMesh.text = exp.company;
    companyMesh.fontSize = 0.2;
    companyMesh.color = "white";
    companyMesh.position.set(leftEdge, topEdge - spacing, 0.1);
    companyMesh.anchorX = "left";
    companyMesh.maxWidth = CARD_WIDTH - MARGIN * 2;
    companyMesh.overflowWrap = "break-word";
    companyMesh.sync();

    const dateMesh = new Text();
    dateMesh.text = `${exp.startDate} - ${exp.endDate}`;
    dateMesh.fontSize = 0.15;
    dateMesh.color = "white";
    dateMesh.position.set(leftEdge, topEdge - spacing * 2, 0.1);
    dateMesh.anchorX = "left";
    dateMesh.maxWidth = CARD_WIDTH - MARGIN * 2;
    dateMesh.overflowWrap = "break-word";
    dateMesh.sync();

    const border = new THREE.LineSegments(edges, borderMaterial);

    const cardGroup = new THREE.Group();
    cardGroup.add(plane);
    cardGroup.add(border);
    cardGroup.add(titleMesh);
    cardGroup.add(companyMesh);
    cardGroup.add(dateMesh);

    const yOffset = INITIAL_CARD_Y_POSITION - CARD_SPACING * index;
    const xOffset = index % 2 === 0 ? -CARD_X_OFFSET : CARD_X_OFFSET;
    cardGroup.position.set(xOffset, yOffset, 0);

    // Alternate tilt
    cardGroup.rotation.y = index % 2 === 0 ? Math.PI / 12 : -Math.PI / 12;

    cardGroups.push(cardGroup);

    scene.add(cardGroup);
  });

  return cardGroups;
}

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
    new THREE.MeshStandardMaterial({ color: 0xff6633, wireframe: true }),
  );
  doughnut.position.set(1, 0, 0);
  doughnut.rotation.x = Math.PI / 2;
  doughnut.rotation.z = Math.PI / 6;
  scene.add(doughnut);
  return doughnut;
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
    const cards = addExperienceCard(scene);
    addStars(scene);

    const pointLight = new THREE.PointLight(0xffffff, 4, 100);
    pointLight.position.set(5, 0, 0);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enableDamping = true;

    camera.position.z = 5;
    const initialCameraY = camera.position.y;

    const handleScroll = () => {
      const scrollPercent = window.scrollY / window.innerHeight;
      const targetY = initialCameraY - scrollPercent * 10;

      // Add camera rotation based on scroll
      const rotationX = scrollPercent * 0.5; // control tilt sensitivity
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
    let cardAngle = 0;
    let doughnutAngle = 0;

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      cube.rotation.x += 0.5 * delta;
      cube.rotation.y += 0.5 * delta;

      // Doughnut animation with its own angle
      const oscillationAngle = Math.sin(doughnutAngle * 0.5) * (Math.PI / 4);
      doughnut.rotation.z += 0.1 * delta;
      doughnut.rotation.y = oscillationAngle;
      doughnutAngle = (doughnutAngle + delta) % (Math.PI * 4);

      // Cards animation with separate angle
      cards.forEach((card, index) => {
        const baseAngle = Math.PI / 12;
        const phaseOffset = (index * Math.PI) / 3;
        const oscillation = Math.sin(cardAngle * 2 + phaseOffset) * 0.05;

        card.rotation.y =
          (index % 2 === 0 ? baseAngle : -baseAngle) + oscillation;
      });
      cardAngle = (cardAngle + delta) % (Math.PI * 2);

      // Render the scene and update controls
      renderer.render(scene, camera);
      controls.update();
    });

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
      className="w-full min-h-full fixed top-0 left-0 z-[-1] h-[300vh] overflow-auto"
    ></div>
  );
}
