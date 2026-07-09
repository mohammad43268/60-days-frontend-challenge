import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ==========================================
// 1. DAYLIGHT ENVIRONMENT & OPTICS
// ==========================================
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();

// Bright Daylight Blue Sky & Atmospheric Haze
const skyColor = new THREE.Color(0x87ceeb);
scene.background = skyColor;
scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  2000,
);
camera.position.set(-5, 1.5, 6); // Cinematic Intro Angle

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1; // Lowered exposure for bright daylight so it doesn't blind you
container.appendChild(renderer.domElement);

const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;
scene.environmentIntensity = 0.6; // High reflection for daylight
pmremGenerator.dispose();

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Subtle bloom for sun glare on chrome
composer.addPass(
  new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.03,
    0.1,
    1.2,
  ),
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01;
controls.minDistance = 4;
controls.maxDistance = 40;
controls.enabled = false;

// ==========================================
// 2. GREEN FIELDS & MODERN DAYLIGHT
// ==========================================

// Ground
const floorGeo = new THREE.PlaneGeometry(2000, 2000);

const floorMat = new THREE.MeshStandardMaterial({
  color: 0x6b8f5a,
  roughness: 0.95,
  metalness: 0.0,
});

const floorPlane = new THREE.Mesh(floorGeo, floorMat);
floorPlane.rotation.x = -Math.PI / 2;
floorPlane.receiveShadow = true;
scene.add(floorPlane);

// =========================
// LIGHTING
// =========================

// Soft Ambient Sky Light
const ambientLight = new THREE.AmbientLight(0xe6f2ff, 0.35);
scene.add(ambientLight);

// Main Sun
const sunLight = new THREE.DirectionalLight(0xfff3d6, 0.6);

sunLight.position.set(120, 180, 80);
sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;

sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 600;

sunLight.shadow.camera.left = -80;
sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top = 80;
sunLight.shadow.camera.bottom = -80;

sunLight.shadow.bias = -0.0002;
sunLight.shadow.radius = 8;

scene.add(sunLight);

// Sky Fill Light
const skyLight = new THREE.DirectionalLight(0xbfdfff, 0.6);

skyLight.position.set(-100, 120, -100);
scene.add(skyLight);

// Ground Bounce
const bounceLight = new THREE.HemisphereLight(0xddeeff, 0x5f7045, 0.5);

scene.add(bounceLight);

// =========================
// ATMOSPHERE
// =========================

scene.background = new THREE.Color(0xbfdcff);

scene.fog = new THREE.FogExp2(0xbfdcff, 0.002);

// ==========================================
// 3. BULLETPROOF ASSET LOADING
// ==========================================
const loader = new GLTFLoader();
const carGroup = new THREE.Group();
scene.add(carGroup);
const buildingColliders = [];

// A. CITY BUILDINGS
loader.load("/apps-lux_building.glb", (gltf) => {
  const baseBuilding = gltf.scene;

  for (let z = 100; z >= -1200; z -= 150) {
    const bLeft = baseBuilding.clone();

    bLeft.scale.set(0.65, 0.75, 0.65); // Smaller buildings
    bLeft.rotation.y = Math.PI / 2;
    bLeft.position.set(-50, 0, z);

    const leftBox = new THREE.Box3().setFromObject(bLeft);
    bLeft.position.y = -leftBox.min.y; // Snap to ground

    const bRight = baseBuilding.clone();

    bRight.scale.set(0.65, 0.75, 0.65); // Smaller buildings
    bRight.rotation.y = -Math.PI / 2;
    bRight.position.set(50, 0, z);

    const rightBox = new THREE.Box3().setFromObject(bRight);
    bRight.position.y = -rightBox.min.y; // Snap to ground

    [bLeft, bRight].forEach((building) => {
      building.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            child.material.roughness = 1.0;
            child.material.metalness = 0.0;
            child.material.envMapIntensity = 0.03;
          }
        }
      });

      scene.add(building);

      // NO COLLISIONS
      // buildingColliders.push(...)
    });
  }
});
// B. AUDI NOVULARI
loader.load("/audi_novulari/scene.gltf", (gltf) => {
  const audi = gltf.scene;

  // FIX: Rotate the mesh so its nose points perfectly down local -Z
  audi.rotation.y = Math.PI / 2;
  audi.position.set(0, 0, 0);

  audi.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
      if (c.material && c.material.name.toLowerCase().includes("glass")) {
        c.material.transparent = true;
        c.material.opacity = 0.5;
        c.material.color.setHex(0x222222); // Tint the glass dark for daylight
      }
    }
  });

  carGroup.add(audi);
  camera.lookAt(carGroup.position);
});

// ==========================================
// 4. CLEAN SPORT-TUNED AUDIO
// ==========================================
let audioCtx = null;
let engineOsc = null;

function bootAcoustics() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();

  engineOsc = audioCtx.createOscillator();
  engineOsc.type = "sawtooth";
  engineOsc.frequency.setValueAtTime(60, audioCtx.currentTime);

  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(250, audioCtx.currentTime);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

  engineOsc.connect(filter).connect(gain).connect(audioCtx.destination);
  engineOsc.start();
}

// ==========================================
// 5. THE IGNITION & CAMERA LOCK
// ==========================================
let gameStarted = false;

document.getElementById("ignite-btn").addEventListener("click", () => {
  if (gameStarted || carGroup.children.length === 0) return;
  gameStarted = true;

  bootAcoustics();
  document.getElementById("intro-screen").classList.remove("active");

  const tl = gsap.timeline({
    onComplete: () => {
      controls.enabled = true;
    },
  });

  tl.to("#hud", { opacity: 1, duration: 1.0, ease: "power2.out" }, 0.5);

  // Sweep camera directly behind the car
  tl.to(
    camera.position,
    {
      x: 0,
      y: 2.5,
      z: 8.0,
      duration: 1.5,
      ease: "power3.inOut",
      onUpdate: () => camera.lookAt(carGroup.position),
    },
    0,
  );
});

// ==========================================
// 6. BULLETPROOF LOCAL PHYSICS
// ==========================================
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false;
});

let speed = 0;
const clock = new THREE.Clock();

function executePhysics(dt) {
  if (!gameStarted || carGroup.children.length === 0) return;

  // 1. Speed Logic
  if (keys.w) speed += 25 * dt;
  else if (keys.s) speed -= 35 * dt;
  else speed *= 0.96; // Coasting friction

  speed = THREE.MathUtils.clamp(speed, -15, 45);
  if (Math.abs(speed) < 0.1) speed = 0;

  // 2. Steering Logic (Only steer if the car is actually moving)
  if (Math.abs(speed) > 0.5) {
    const steerFactor = Math.max(0.4, 1.0 - Math.abs(speed) / 50);
    const direction = speed > 0 ? 1 : -1; // Reverse steering when backing up

    // Rotate the entire car group locally
    if (keys.a) carGroup.rotateY(2.0 * steerFactor * direction * dt);
    if (keys.d) carGroup.rotateY(-2.0 * steerFactor * direction * dt);
  }

  // 3. Move Forward (Using Native Translate - Unbreakable)
  const previousPosition = carGroup.position.clone();
  carGroup.translateZ(-speed * dt); // -Z is native forward in Three.js

  // 4. Elastic Chase Camera
  if (controls.enabled) {
    // Determine where the camera *should* be relative to the car's current rotation
    const relativeCamOffset = new THREE.Vector3(0, 2.5, 8.0);
    const targetCamPos = carGroup.position
      .clone()
      .add(relativeCamOffset.applyQuaternion(carGroup.quaternion));

    camera.position.lerp(targetCamPos, 8.0 * dt);

    const lookTarget = carGroup.position
      .clone()
      .add(new THREE.Vector3(0, 1.0, 0));
    controls.target.lerp(lookTarget, 15.0 * dt);
  }

  // 5. Audio & UI Updates
  const calcKMH = Math.round(Math.abs(speed) * 3.6);
  document.getElementById("speed-val").innerText = `${calcKMH} KM/H`;
  document.getElementById("rpm-val").innerText = Math.round(
    800 + Math.abs(speed) * 150,
  );
  document.getElementById("gear-val").innerText =
    speed < -0.1 ? "REV" : "DRIVE";

  if (audioCtx && engineOsc) {
    engineOsc.frequency.setValueAtTime(
      60 + Math.abs(speed) * 4,
      audioCtx.currentTime,
    );
  }
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

const tickClock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = tickClock.getDelta();
  if (dt > 0.1) return;

  executePhysics(dt);
  controls.update();
  composer.render();
}

animate();
