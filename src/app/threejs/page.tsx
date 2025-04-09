"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const debugObject = {
      color: "#ff5900",
      subdivision: 2,
      spin() {
        gsap.to(mesh.rotation, {
          y: mesh.rotation.y + Math.PI * 2,
        });
      },
    };

    // Scene and Camera
    const scene = new THREE.Scene();
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = (stuff) => {
      console.log("onStart", stuff);
    };
    loadingManager.onError = (stuff) => {
      console.log("onError", stuff);
    };
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const colorTexture = textureLoader.load("/textures/checkerboard-8x8.png");
    const alphaTexture = textureLoader.load("/textures/door/alpha.jpg");
    const heightTexture = textureLoader.load("/textures/door/height.jpg");
    const normalTexture = textureLoader.load("/textures/door/normal.jpg");
    const roughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
    const metalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
    const ambientOcclusionTexture = textureLoader.load(
      "/textures/door/ambientOcclusion.jpg",
    );

    // colorTexture.repeat.set(2, 2);
    // colorTexture.wrapS = THREE.RepeatWrapping;
    // colorTexture.wrapT = THREE.RepeatWrapping;
    // colorTexture.rotation = Math.PI * 0.25;
    // colorTexture.center.x = 0.5;
    // colorTexture.center.y = 0.5;
    colorTexture.generateMipmaps = false;
    colorTexture.minFilter = THREE.NearestFilter;
    colorTexture.magFilter = THREE.NearestFilter;

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.z = 3;
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // GUI
    const gui = new GUI({
      width: 300,
    });

    gui.close();

    // Mesh
    const trianglesCount = 500;
    const trianglePositionsArray = new Float32Array(trianglesCount * 3 * 3);
    for (let i = 0; i < trianglesCount * 3 * 3; i++) {
      trianglePositionsArray[i] = Math.random() * 2 - 1;
    }
    const trianglesGeometry = new THREE.BufferGeometry();
    trianglesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(trianglePositionsArray, 3),
    );

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const mesh = new THREE.Mesh(
      // trianglesGeometry,
      geometry,
      new THREE.MeshBasicMaterial({
        // color: debugObject.color,
        map: colorTexture,
        wireframe: false,
      }),
    );
    scene.add(mesh);

    gui.add(mesh.position, "y").min(-3).max(3).step(0.01).name("elevation");
    gui.add(mesh.material, "wireframe");
    gui.addColor(debugObject, "color").onChange(() => {
      mesh.material.color.set(debugObject.color);
    });
    gui.add(debugObject, "spin");
    gui
      .add(debugObject, "subdivision")
      .min(1)
      .max(20)
      .step(1)
      .onFinishChange(() => {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(
          1,
          1,
          1,
          debugObject.subdivision,
          debugObject.subdivision,
          debugObject.subdivision,
        );
      });

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Animation Loop
    const animate = () => {
      renderer.render(scene, camera);
      controls.update();
      requestAnimationFrame(animate);
    };
    animate();

    // Event Listeners (Added Inside useEffect)
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const onDoubleClick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    window.addEventListener("resize", onResize);
    canvasRef.current?.addEventListener("dblclick", onDoubleClick);

    // Cleanup Function (Ensures Proper HMR)
    return () => {
      gui.destroy();
      controls.dispose();
      scene.remove(mesh);
      renderer.dispose();

      window.removeEventListener("resize", onResize);
      window.removeEventListener("dblclick", onDoubleClick);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}
