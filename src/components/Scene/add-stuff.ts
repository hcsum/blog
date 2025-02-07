import { experience } from "../Experience";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Text } from "troika-three-text";

export function addExperienceCards(scene: THREE.Scene) {
  const INITIAL_CARD_Y_POSITION = -5;
  const CARD_SPACING = 4;
  const CARD_X_OFFSET = window.innerWidth < 768 ? -0.1 : 0.5; // magic number -0.1 temp fix for mobile
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

    const titleMesh = new Text();
    titleMesh.text = exp.title;
    titleMesh.fontSize = 0.2;
    titleMesh.color = "white";
    titleMesh.position.set(leftEdge, topEdge, 0.1);
    titleMesh.anchorX = "left";
    titleMesh.maxWidth = CARD_WIDTH - MARGIN * 2;
    titleMesh.lineHeight = 1.1;
    titleMesh.overflowWrap = "break-word";
    titleMesh.sync();

    const dateMesh = new Text();
    dateMesh.text = `${exp.startDate} - ${exp.endDate}`;
    dateMesh.fontSize = 0.15;
    dateMesh.color = "white";
    dateMesh.position.set(leftEdge, -CARD_HEIGHT / 2 + MARGIN, 0.1);
    dateMesh.anchorX = "left";
    dateMesh.maxWidth = CARD_WIDTH - MARGIN * 2;
    dateMesh.overflowWrap = "break-word";
    dateMesh.sync();

    const border = new THREE.LineSegments(edges, borderMaterial);

    const cardGroup = new THREE.Group();
    cardGroup.add(plane);
    cardGroup.add(border);
    cardGroup.add(titleMesh);
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

export function addStars(scene: THREE.Scene) {
  const starGeometry = new THREE.SphereGeometry(0.05, 4, 4);
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

export function addCube(
  scene: THREE.Scene,
  textureLoader: THREE.TextureLoader,
) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load("/images/me.png"),
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  return cube;
}

export function addRing(
  scene: THREE.Scene,
  textureLoader: THREE.TextureLoader,
) {
  const torus = new THREE.TorusGeometry(3.5, 0.3, 16, 100);
  const texture = textureLoader.load("/images/bg2.jpg");
  texture.wrapS = THREE.RepeatWrapping; // 允许纹理在 S 轴上重复
  texture.wrapT = THREE.RepeatWrapping; // 允许纹理在 T 轴上重复
  texture.repeat.set(2, 2);
  const ring = new THREE.Mesh(
    torus,
    new THREE.MeshStandardMaterial({
      map: texture,
    }),
  );
  ring.position.set(0.5, -1, 0);
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI / 6;
  const cube = addCube(scene, textureLoader);
  ring.add(cube);
  scene.add(ring);
  return { ring, cube };
}

export function addAstronaut(
  scene: THREE.Scene,
  textureLoader: THREE.TextureLoader,
): Promise<THREE.Mesh> {
  return new Promise((resolve) => {
    const manager = new THREE.LoadingManager();
    const loader = new OBJLoader(manager);
    const material = new THREE.MeshMatcapMaterial({
      matcap: textureLoader.load("/images/blue.jpg"),
    });

    loader.load("./models/astronaut.obj", (obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = new THREE.Mesh(child.geometry, material);
          mesh.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
          scene.add(mesh);
          resolve(mesh);
        }
      });
    });
  });
}
