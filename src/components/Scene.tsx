"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function addStars(scene: THREE.Scene) {
  const starCount = 1000; // Reduced count since spheres are more geometry-heavy
  const starGeometry = new THREE.SphereGeometry(0.05, 8, 8); // Small radius, fewer segments for performance
  const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff, // Makes the stars glow
    emissiveIntensity: 1,
  });

  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);

    // Random position
    star.position.x = THREE.MathUtils.randFloatSpread(100);
    star.position.y = THREE.MathUtils.randFloatSpread(100);
    star.position.z = THREE.MathUtils.randFloatSpread(100);

    scene.add(star);
  }
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

    // Add cube with texture
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load("/images/me.png"),
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const torus = new THREE.TorusGeometry(4, 0.2, 16, 100);
    const doughnut = new THREE.Mesh(
      torus,
      new THREE.MeshStandardMaterial({ color: 0xff6633 }),
    );
    doughnut.position.set(1, 0, 0);
    doughnut.rotation.x = Math.PI / 4;
    doughnut.rotation.z = Math.PI / 6;
    scene.add(doughnut);

    const pointLight = new THREE.PointLight(0xffffff, 4, 100);
    pointLight.position.set(5, 0, 0);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // const cameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
    // const gridHelper = new THREE.GridHelper(200, 50);
    // const lightHelper = new THREE.PointLightHelper(pointLight);
    // scene.add(cameraHelper, gridHelper, lightHelper);

    addStars(scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    camera.position.z = 5;

    function animate() {
      renderer.render(scene, camera);
      controls.update();
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      doughnut.rotation.x += 0.001;
      doughnut.rotation.y += 0.0005;
    }
    renderer.setAnimationLoop(animate);

    // Handle cleanup
    return () => {
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full"></div>;
}
