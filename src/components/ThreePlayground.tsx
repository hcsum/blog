"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";

export default function ThreePlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sizes = {
      width: window.innerWidth,
      height: Math.max(window.innerHeight * 0.75, 720),
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

    const scene = new THREE.Scene();
    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const colorTexture = textureLoader.load("/textures/door/color.jpg");

    colorTexture.colorSpace = THREE.SRGBColorSpace;
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

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const gui = new GUI({ width: 300 });
    gui.close();

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
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

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    let frameId = 0;
    const animate = () => {
      renderer.render(scene, camera);
      controls.update();
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = Math.max(window.innerHeight * 0.75, 720);
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const onDoubleClick = () => {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
      } else {
        void document.exitFullscreen();
      }
    };

    window.addEventListener("resize", onResize);
    canvasRef.current.addEventListener("dblclick", onDoubleClick);

    return () => {
      cancelAnimationFrame(frameId);
      gui.destroy();
      controls.dispose();
      scene.remove(mesh);
      renderer.dispose();
      window.removeEventListener("resize", onResize);
      canvasRef.current?.removeEventListener("dblclick", onDoubleClick);
    };
  }, []);

  return <canvas className="min-h-[720px] w-full rounded-[1.75rem]" ref={canvasRef} />;
}
