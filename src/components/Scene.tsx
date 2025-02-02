"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experience } from "./Experience";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

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

    // Calculate positions relative to plane dimensions
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

    // Create border
    const border = new THREE.LineSegments(edges, borderMaterial);

    // Group the plane, border, and texts
    const cardGroup = new THREE.Group();
    cardGroup.add(plane);
    cardGroup.add(border);
    cardGroup.add(titleMesh);
    cardGroup.add(companyMesh);
    cardGroup.add(dateMesh);

    // Calculate position
    const yOffset = INITIAL_CARD_Y_POSITION - CARD_SPACING * index;
    const xOffset = index % 2 === 0 ? -CARD_X_OFFSET : CARD_X_OFFSET;
    cardGroup.position.set(xOffset, yOffset, 0);

    // Alternate tilt
    cardGroup.rotation.y = index % 2 === 0 ? Math.PI / 12 : -Math.PI / 12;

    // Store references
    cardGroups.push(cardGroup);

    // Add to scene
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
    new THREE.MeshStandardMaterial({ color: 0xff6633 }),
  );
  doughnut.position.set(1, 0, 0);
  doughnut.rotation.x = Math.PI / 4;
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

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    currentMount.appendChild(labelRenderer.domElement);

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

    const controls = new OrbitControls(camera, labelRenderer.domElement);
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

      // Rotate the cube
      cube.rotation.x += 0.5 * delta;
      cube.rotation.y += 0.5 * delta;

      // Rotate the doughnut
      doughnut.rotation.x += 0.05 * delta;
      doughnut.rotation.y += 0.025 * delta;

      // Oscillating animation for the experience cards
      angle = (angle + delta) % (Math.PI * 2);

      cards.forEach((card, index) => {
        const baseAngle = Math.PI / 12;
        const phaseOffset = (index * Math.PI) / 3;
        const oscillation = Math.sin(angle * 2 + phaseOffset) * 0.1;

        // Animate the card's slight rotation
        card.rotation.y =
          (index % 2 === 0 ? baseAngle : -baseAngle) + oscillation;
      });

      // Render the scene and update controls
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera); // Remove this if using troika-three-text or CanvasTexture
      controls.update();
    });

    // Update cleanup
    return () => {
      currentMount.removeChild(renderer.domElement);
      currentMount.removeChild(labelRenderer.domElement);
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
