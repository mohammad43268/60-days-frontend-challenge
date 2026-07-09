import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin.js";
import Lenis from "lenis";

// --- SMART DEVICE DETECTION (Performance Optimization) ---
const isMobile = window.innerWidth < 768;

// --- Initialization ---
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const splitText = (selector) => {
  const el = document.querySelector(selector);
  if (!el) return;
  const txt = el.innerText;
  el.innerHTML = txt
    .split("")
    .map((c) =>
      c === " "
        ? "&nbsp;"
        : `<span style="display:inline-block; opacity:0; transform:translateY(30px) rotateX(-90deg); filter:blur(10px); transform-origin:bottom center;">${c}</span>`,
    )
    .join("");
  return el.querySelectorAll("span");
};

// --- Three.js Setup ---
const canvas = document.querySelector("#webgl-canvas");
const scene = new THREE.Scene();
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(
  40,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(0, 0, 7);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
// Limit pixel ratio on phones to stop lag
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.enablePan = false;
controls.enableZoom = false;
controls.minAzimuthAngle = -Math.PI / 6;
controls.maxAzimuthAngle = Math.PI / 6;
controls.minPolarAngle = Math.PI / 2.5;
controls.maxPolarAngle = Math.PI / 1.8;

// --- Lighting & Atmosphere ---
new RGBELoader().load("/studio.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});
scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const keyLight = new THREE.DirectionalLight(0xe5e5cb, 5);
keyLight.position.set(5, 5, 4);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xd5cea3, 6);
rimLight.position.set(-6, 5, -4);
scene.add(rimLight);

// Reduce 3D dust particles for mobile
const particlesCount = isMobile ? 150 : 700;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 15;
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const dustMaterial = new THREE.PointsMaterial({
  size: 0.015,
  color: 0xd5cea3,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
scene.add(dustParticles);

// --- Model Configuration ---
const getResponsiveConfig = () => {
  const w = window.innerWidth;
  if (w > 1400) return { scale: 1.35, x: 1.5, y: -1.8 };
  if (w > 1024) return { scale: 1.2, x: 1.2, y: -1.6 };
  if (w > 768) return { scale: 0.9, x: 0.8, y: -1.3 };
  return { scale: 0.7, x: 0.2, y: -1.5 };
};

const modelGroup = new THREE.Group();
scene.add(modelGroup);
const hotspots = [];
const gltfLoader = new GLTFLoader();
let headsetModel;

const sChars = splitText(".back-text");
const siChars = splitText(".front-text");
gsap.set(".new-hotspot", { opacity: 0, pointerEvents: "none" });

// --- Animation Timelines ---
gltfLoader.load("/headphones.glb", (gltf) => {
  headsetModel = gltf.scene;
  const cfg = getResponsiveConfig();

  headsetModel.scale.set(0.01, 0.01, 0.01);
  modelGroup.add(headsetModel);
  modelGroup.position.set(cfg.x, cfg.y + 3, -2);
  modelGroup.rotation.set(0.6, -Math.PI * 1.2, -0.4);

  const hp1 = new THREE.Object3D();
  hp1.position.set(-1.2, 0, 0);
  headsetModel.add(hp1);
  const hp2 = new THREE.Object3D();
  hp2.position.set(0, 1.6, 0);
  headsetModel.add(hp2);
  const hp3 = new THREE.Object3D();
  hp3.position.set(1.2, 0, 0);
  headsetModel.add(hp3);
  hotspots.push({
    position: hp1,
    element: document.querySelector("#hotspot-1"),
  });
  hotspots.push({
    position: hp2,
    element: document.querySelector("#hotspot-2"),
  });
  hotspots.push({
    position: hp3,
    element: document.querySelector("#hotspot-3"),
  });

  // 1. Hero Entrance
  const tl = gsap.timeline();
  tl.to(
    headsetModel.scale,
    { x: cfg.scale, y: cfg.scale, z: cfg.scale, duration: 2, ease: "expo.out" },
    0,
  )
    .to(
      modelGroup.position,
      { y: cfg.y, x: cfg.x, z: 0, duration: 2.2, ease: "power4.out" },
      0,
    )
    .to(
      modelGroup.rotation,
      { x: 0.3, y: -0.7, z: -0.2, duration: 2.5, ease: "power3.out" },
      0,
    );
  if (sChars)
    tl.to(
      sChars,
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        filter: "blur(0px)",
        duration: 1.4,
        stagger: 0.04,
        ease: "power3.out",
      },
      0.2,
    );
  if (siChars)
    tl.to(
      siChars,
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        filter: "blur(0px)",
        duration: 1.4,
        stagger: 0.05,
        ease: "power3.out",
      },
      0.4,
    );
  tl.to(
    ".meta-block",
    { opacity: 1, translateY: 0, duration: 1.2, ease: "power2.out" },
    1.2,
  ).to("#hotspot-1", { opacity: 1, duration: 1 }, 2);

  // 2. Section 2 (Features)
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".features-section",
      start: "top bottom",
      end: "center center",
      scrub: 1,
    },
  });
  scrollTl
    .to(modelGroup.position, { x: 0, y: -3.0, z: 0, ease: "power1.inOut" }, 0)
    .to(modelGroup.rotation, { x: 0.1, y: -0.2, z: 0, ease: "power1.inOut" }, 0)
    .to(".features-content.left", { opacity: 1, x: 0, ease: "power2.out" }, 0)
    .to(".features-content.right", { opacity: 1, x: 0, ease: "power2.out" }, 0)
    .to(
      ".new-hotspot",
      { opacity: 1, pointerEvents: "auto", ease: "power1.inOut" },
      0,
    );

  // 3. Section 3 (Color Studio)
  const colorTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".color-section",
      start: "top bottom",
      end: "center center",
      scrub: 1,
    },
  });
  colorTl
    .to(
      modelGroup.position,
      { x: -1.2, y: -3.0, z: 3.0, ease: "power1.inOut" },
      0,
    )
    .to(
      modelGroup.rotation,
      { x: 0.1, y: Math.PI / 3, z: 0, ease: "power1.inOut" },
      0,
    )
    .to(
      ".new-hotspot",
      { opacity: 0, pointerEvents: "none", ease: "power1.inOut" },
      0,
    )
    .to(".color-ui", { opacity: 1, x: 0, ease: "power2.out" }, 0)
    .to(".floating-bg", { opacity: 1, scale: 1, ease: "power2.out" }, 0)
    .to(
      ".color-ui .section-title",
      { color: "#1A120B", ease: "power1.inOut" },
      0,
    )
    .to(
      ".color-ui .section-title span",
      { color: "#3C2A21", ease: "power1.inOut" },
      0,
    )
    .to(".color-ui p", { color: "#1A120B", ease: "power1.inOut" }, 0)
    .to(
      ".color-ui",
      {
        background: "rgba(255, 255, 255, 0.3)",
        borderColor: "rgba(26, 18, 11, 0.1)",
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.05)",
      },
      0,
    );

  // 3.5. Gallery Bridge
  gsap.to(".floating-bg", {
    scrollTrigger: {
      trigger: ".gallery-section",
      start: "top center",
      end: "bottom center",
      scrub: 1,
    },
    opacity: 0,
    scale: 0.5,
    ease: "power1.inOut",
  });

  // 4. Section 4 (Preorder & Marquee)
  const checkoutTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".checkout-section",
      start: "top bottom",
      end: "center center",
      scrub: 1,
    },
  });
  checkoutTl
    .fromTo(
      modelGroup.position,
      { y: 5, x: 0, z: 0 },
      { y: -4.8, ease: "power1.inOut" },
      0,
    )
    .to(modelGroup.rotation, { x: 0.1, y: 0, z: 0, ease: "power1.inOut" }, 0)
    .to(".marquee-container", { opacity: 1, ease: "power2.out" }, 0)
    .to(".checkout-ui", { opacity: 1, y: 0, ease: "power2.out" }, 0)
    .to(".badge", { opacity: 1, y: 0, stagger: 0.1, ease: "power2.out" }, 0);

  // --- Footer Parallax Reveal ---
  gsap.from(".massive-footer-logo h1", {
    scrollTrigger: {
      trigger: ".footer-section",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
    },
    y: 150,
    opacity: 0,
    ease: "power1.out",
  });

  // --- Material Color Switcher ---
  const colors = {
    white: new THREE.Color(0xe5e5cb),
    black: new THREE.Color(0x111111),
    bronze: new THREE.Color(0x8c7c61),
  };
  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", (e) => {
      const targetColor = colors[e.target.getAttribute("data-color")];
      headsetModel.traverse((child) => {
        if (child.isMesh && child.material) {
          gsap.to(child.material.color, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b,
            duration: 0.8,
            ease: "power2.out",
          });
        }
      });
    });
  });
});

// --- UI Actions ---
document.getElementById("back-to-top").addEventListener("click", () => {
  lenis.scrollTo(0, {
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
});

// --- Runner Engine ---
gsap.to("#wave-track", { x: -200, duration: 4, ease: "none", repeat: -1 });
gsap.to("#kinetic-runner", {
  duration: 4,
  repeat: -1,
  ease: "none",
  motionPath: {
    path: "#wave-track",
    align: "#wave-track",
    alignOrigin: [0.5, 0.5],
    autoRotate: true,
  },
});

// --- Resize & Mouse ---
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  if (modelGroup && headsetModel) {
    const cfg = getResponsiveConfig();
    headsetModel.scale.set(cfg.scale, cfg.scale, cfg.scale);
  }
});
const cursor = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = -(e.clientY / sizes.height - 0.5);
});

// --- Render Loop ---
const tempV = new THREE.Vector3();
const tick = () => {
  controls.update();
  dustParticles.rotation.y += 0.0005;
  dustParticles.position.x = cursor.x * 0.5;

  if (headsetModel) {
    const tX = cursor.x * 0.3;
    const tY = cursor.y * 0.3;
    headsetModel.position.x += (tX - headsetModel.position.x) * 0.05;
    headsetModel.position.y += (tY - headsetModel.position.y) * 0.05;
    headsetModel.position.y += Math.sin(Date.now() * 0.001) * 0.003;
    headsetModel.rotation.z += Math.cos(Date.now() * 0.001) * 0.0005;

    for (const point of hotspots) {
      point.position.getWorldPosition(tempV);
      tempV.project(camera);
      const x = (tempV.x * 0.5 + 0.5) * sizes.width;
      const y = -(tempV.y * 0.5 - 0.5) * sizes.height;
      point.element.style.transform = `translate(${x}px, ${y}px)`;
    }
  }
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
