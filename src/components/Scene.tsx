"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const experience = [
  {
    title: "Founding Engineer (part-time)",
    startDate: "Apr 2024",
    endDate: "present",
    img: "ai4xm.jpeg",
    altText: "Logo for AI4XM LTD",
    externalLink: "https://ai4xm.cn/",
    details:
      "Setting up infra and coding everything. If you sees my job application, that means this project didn't go too well 🙂. I am also freelancing and working on my own projects and trying to contribute to opensource.",
    chips: ["PostgresDB", "NodeJS", "ReactJS", "NextJS"],
  },
  {
    title: "Full-stack Software Engineer",
    startDate: "Sep 2022",
    endDate: "Apr 2024",
    img: "eventx.jpg",
    altText: "Logo for Eventx",
    externalLink: "https://eventx.io/",
    details:
      "Full-stack development from data model design, backend, to frontend. At Eventx, they expect engineer be the owner of the whole featrue, instead of spliting backend and frontend. I was charged to implemented business critical features like the Email system and Order creation process. I also joined technical and product discussions for new features.",
    challenge:
      "It was daunting to work full-stack at first, as I had to propose data model design and discuss with the system architect. But I managed to get good at it.",
    chips: ["TypeScript", "PostgresDB", "NodeJS", "ReactJS", "TypeORM"],
  },
  {
    title: "Senior Software Engineer",
    startDate: "Nov 2020",
    endDate: "Sep 2022",
    img: "EPAM_logo.png",
    altText: "Logo for EPAM",
    externalLink: "https://www.epam.com/",
    details: "Still working with client Expedia.",
    chips: ["TypeScript", "NodeJS", "ReactJS", "GraphQL", "ApolloClient"],
  },
  {
    title: "Software Engineer",
    startDate: "Nov 2019",
    endDate: "Nov 2020",
    img: "EPAM_logo.png",
    altText: "Logo for EPAM",
    externalLink: "https://www.epam.com/",
    details:
      "Consulted for Expedia Group, the US online travel agent company. Worked with their Partner Central team based in Shenzhen. Led and built frontend pages for cancellation policy, reservation deposit policy settings. Worked with SCRUM master on regular basis to estimate project scope. Demo new features to key stakeholders and senior VPs on behalf of the team.",
    chips: ["TypeScript", "NodeJS", "ReactJS", "GraphQL", "ApolloClient"],
  },
  {
    title: "Software Engineer",
    startDate: "Nov 2018",
    endDate: "Nov 2019",
    img: "fagougou.jpeg",
    altText: "Logo for fagougou",
    externalLink: "https://www.fagougou.com",
    details:
      "Developed and maintained the frontend of a client facing web app, and an internal web workflow tool. My first pro tech job. Can't imagine how thrilled I was when I got the job.",
    challenge:
      "They use Vue and Nuxt, but I didn't know any at the time. The only FE framework I learnt was React. I grinded online tutorials and docs for 2 weeks and made my first commit as a pro.",
    chips: ["VueJS", "NuxtJS"],
  },
];

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

    // Calculate position
    const yOffset = -5 - (2 + 1) * index;
    const xOffset = index % 2 === 0 ? -0.5 : 0.5;
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

    const renderer = new THREE.WebGLRenderer();
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
    const initialCameraY = camera.position.y; // 0

    let angle = 0; // Add this to track rotation

    const handleMovement = (event: WheelEvent | KeyboardEvent) => {
      let delta: number;

      if (event instanceof WheelEvent) {
        delta = -event.deltaY * 0.01;
      } else if (event instanceof KeyboardEvent) {
        if (!["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key))
          return;
        if (event.key === "PageUp" || event.key === "PageDown") {
          delta = event.key === "PageUp" ? 0.5 : -0.5;
        } else {
          delta = event.key === "ArrowUp" ? 0.2 : -0.2;
        }
      } else {
        return;
      }

      const newY = camera.position.y + delta;

      // Only update if we're not going above the initial position
      if (newY <= initialCameraY) {
        camera.position.y = newY;
        controls.target.y += delta;
        controls.update();
      }
    };

    window.addEventListener("wheel", handleMovement);
    window.addEventListener("keydown", handleMovement);

    // Add resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Use clock for consistent animations
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      // Update animations based on time delta
      cube.rotation.x += 0.5 * delta;
      cube.rotation.y += 0.5 * delta;

      doughnut.rotation.x += 0.05 * delta;
      doughnut.rotation.y += 0.025 * delta;

      angle += delta; // More consistent speed
      cards.forEach((card, index) => {
        const baseAngle = Math.PI / 12;
        const oscillation = Math.sin(angle * 2) * 0.1;
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
      window.removeEventListener("wheel", handleMovement);
      window.removeEventListener("keydown", handleMovement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full min-h-full fixed top-0 left-0 z-[-1]"
    ></div>
  );
}
