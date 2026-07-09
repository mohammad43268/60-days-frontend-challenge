/**
 * ============================================================================
 * THREE.JS MASTER LABORATORY - PREMIUM LIGHT CITRUS EDITION (v0.164.0)
 * File: script.js
 * ============================================================================
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";

// --- 1. DOM TELEMETRY ---
class PerformanceMonitor {
  constructor() {
    this.fpsEl = document.getElementById("metric-fps");
    this.msEl = document.getElementById("metric-ms");
    this.callsEl = document.getElementById("metric-calls");
    this.trianglesEl = document.getElementById("metric-triangles");
    this.frames = 0;
    this.prevTime = performance.now();
  }

  update(renderer) {
    this.frames++;
    const time = performance.now();
    const delta = time - this.prevTime;

    if (delta >= 1000) {
      if (this.fpsEl)
        this.fpsEl.textContent = Math.round((this.frames * 1000) / delta);
      if (this.msEl) this.msEl.textContent = (delta / this.frames).toFixed(1);
      this.frames = 0;
      this.prevTime = time;
    }

    if (renderer && renderer.info && this.callsEl && this.trianglesEl) {
      this.callsEl.textContent = renderer.info.render.calls;
      this.trianglesEl.textContent =
        renderer.info.render.triangles.toLocaleString();
    }
  }
}

// --- 2. POST-PROCESSING (Calibrated for Light Studio Backgrounds) ---
class PostProcessingManager {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Lower strength (0.25) & higher threshold (0.92) so the white background stays crisp
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.25,
      0.4,
      0.92,
    );
    this.composer.addPass(this.bloomPass);

    if (typeof RGBShiftShader !== "undefined") {
      this.rgbShift = new ShaderPass(RGBShiftShader);
      this.rgbShift.uniforms["amount"].value = 0.0008; // Very subtle aberration
      this.composer.addPass(this.rgbShift);
    }

    try {
      if (typeof SMAAPass !== "undefined") {
        const smaa = new SMAAPass(window.innerWidth, window.innerHeight);
        this.composer.addPass(smaa);
      }
    } catch (e) {}
  }

  resize(w, h) {
    this.composer.setSize(w, h);
  }
  render() {
    this.composer.render();
  }
}

// --- 3. GEOMETRY LAB ---
class GeometryLab {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.params = { type: "TorusKnot", wireframe: false, scale: 1, detail: 16 };
    // Hermès Orange Metallic Material
    this.mat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      roughness: 0.15,
      metalness: 0.85,
    });
    this.build();
  }

  build() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.scene.remove(this.mesh);
    }
    let g;
    const d = this.params.detail;
    switch (this.params.type) {
      case "Box":
        g = new THREE.BoxGeometry(2, 2, 2, d, d, d);
        break;
      case "Sphere":
        g = new THREE.SphereGeometry(1.5, d * 2, d);
        break;
      case "Cone":
        g = new THREE.ConeGeometry(1.5, 3, d);
        break;
      case "Cylinder":
        g = new THREE.CylinderGeometry(1, 1, 3, d);
        break;
      case "Torus":
        g = new THREE.TorusGeometry(1.5, 0.5, d, d * 2);
        break;
      case "TorusKnot":
      default:
        g = new THREE.TorusKnotGeometry(1.2, 0.4, d * 4, d);
        break;
    }
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    this.mesh.scale.setScalar(0);
    gsap.to(this.mesh.scale, {
      x: this.params.scale,
      y: this.params.scale,
      z: this.params.scale,
      duration: 0.6,
      ease: "back.out",
    });
  }

  update() {
    if (this.mesh) {
      this.mesh.rotation.x += 0.005;
      this.mesh.rotation.y += 0.01;
    }
  }

  populateGUI(gui) {
    const f = gui.addFolder("Geometry Parameters");
    f.add(this.params, "type", [
      "Box",
      "Sphere",
      "Cone",
      "Cylinder",
      "Torus",
      "TorusKnot",
    ]).onChange(() => this.build());
    f.add(this.params, "detail", 3, 32, 1).onChange(() => this.build());
    f.add(this.params, "scale", 0.2, 2.5).onChange((v) =>
      this.mesh.scale.setScalar(v),
    );
    f.add(this.params, "wireframe").onChange((v) => (this.mat.wireframe = v));
    f.open();
  }

  destroy() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.scene.remove(this.mesh);
    }
  }
}

// --- 4. MATERIAL LAB ---
class MaterialLab {
  constructor(scene) {
    this.scene = scene;
    this.params = {
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      color: "#ff5500",
    };
    // Stunning Translucent Ruby/Orange Glass
    this.mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.params.color),
      roughness: this.params.roughness,
      metalness: this.params.metalness,
      transmission: this.params.transmission,
      ior: this.params.ior,
      thickness: 1.5,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 64), this.mat);
    this.scene.add(this.mesh);
  }

  update() {
    this.mesh.rotation.y += 0.005;
  }

  populateGUI(gui) {
    const f = gui.addFolder("Dielectric PBR Glass");
    f.addColor(this.params, "color").onChange((c) => this.mat.color.set(c));
    f.add(this.params, "roughness", 0, 1).onChange(
      (v) => (this.mat.roughness = v),
    );
    f.add(this.params, "metalness", 0, 1).onChange(
      (v) => (this.mat.metalness = v),
    );
    f.add(this.params, "transmission", 0, 1).onChange(
      (v) => (this.mat.transmission = v),
    );
    f.add(this.params, "ior", 1, 2.3).onChange((v) => (this.mat.ior = v));
    f.open();
  }

  destroy() {
    this.mesh.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}

// --- 5. PARTICLES LAB ---
class ParticleLab {
  constructor(scene) {
    this.scene = scene;
    this.count = 40000;
    this.geom = new THREE.BufferGeometry();
    const pos = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count * 3; i++)
      pos[i] = (Math.random() - 0.5) * 20;
    this.geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.mat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xff8800,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(this.geom, this.mat);
    this.scene.add(this.points);
  }

  update() {
    this.points.rotation.y += 0.002;
  }
  populateGUI(gui) {
    gui.add(this.mat, "size", 0.005, 0.1).name("Particle Size");
  }
  destroy() {
    this.geom.dispose();
    this.scene.remove(this.points);
  }
}

// --- 6. RAW GLSL SHADER LAB ---
class ShaderLab {
  constructor(scene) {
    this.scene = scene;
    this.uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xff6b00) },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      wireframe: true,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; varying vec2 vUv; void main() { gl_FragColor = vec4(uColor * abs(sin(vUv.x * 10.0 + uTime)), 1.0); }`,
    });
    this.mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 4), this.mat);
    this.scene.add(this.mesh);
  }

  update() {
    this.uniforms.uTime.value += 0.03;
    this.mesh.rotation.y += 0.004;
  }
  populateGUI(gui) {}
  destroy() {
    this.mesh.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}

// --- 7. PROCEDURAL PRODUCT CONFIGURATOR ---
class ConfiguratorLab {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.params = { exploded: 0, goldEdition: false };

    // Clean Matte White Ceramic Core
    this.core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32),
      new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        metalness: 0.1,
        roughness: 0.2,
      }),
    );
    // Emissive Vibrant Orange Magnetic Ring
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.15, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xff6b00, emissive: 0xff4500 }),
    );
    this.ring.rotation.x = Math.PI / 2;
    // Top Optical Diamond Lens
    this.lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        roughness: 0,
      }),
    );
    this.lens.position.y = 1.0;

    this.group.add(this.core, this.ring, this.lens);
  }

  update() {
    this.group.rotation.y += 0.005;
  }

  populateGUI(gui) {
    const f = gui.addFolder("Apple/Hermès Concept Configurator");
    f.add(this.params, "exploded", 0, 2)
      .name("Explode View")
      .onChange((v) => {
        gsap.to(this.lens.position, { y: 1.0 + v * 1.5, duration: 0.5 });
        gsap.to(this.ring.scale, {
          x: 1 + v * 0.5,
          y: 1 + v * 0.5,
          duration: 0.5,
        });
      });
    f.add(this.params, "goldEdition")
      .name("Hermès Gold Edition")
      .onChange((v) => {
        this.core.material.color.set(v ? 0xffa800 : 0xfafafa);
        this.core.material.metalness = v ? 0.8 : 0.1;
      });
    f.open();
  }

  destroy() {
    this.scene.remove(this.group);
  }
}

// --- 8. SHOWCASE COMBINED LAB ---
class ShowcaseLab {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0xff6b00,
        transmission: 0.9,
        ior: 2.2,
      }),
    );
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.5, 64),
      new THREE.MeshStandardMaterial({
        color: 0xffa800,
        side: THREE.DoubleSide,
        emissive: 0xff6b00,
      }),
    );
    ring.rotation.x = Math.PI / 3;

    this.group.add(gem, ring);
  }

  update() {
    this.group.rotation.y += 0.008;
    this.group.rotation.z += 0.002;
  }
  populateGUI(gui) {}
  destroy() {
    this.scene.remove(this.group);
  }
}

// --- 9. MASTER APPLICATION MACHINE ---
class MasterLaboratoryApp {
  constructor() {
    this.canvasWrapper = document.getElementById("canvas-wrapper");
    this.guiDom = document.getElementById("gui-container");
    this.activeModule = null;
    this.gui = null;

    this.initWebGL();
    this.initStageLights();
    this.initGizmos();
    this.bindEvents();

    this.dismissLoader();
  }

  initWebGL() {
    this.scene = new THREE.Scene();
    // Match scene background & fog to CSS Light Base (#f4f6f9)
    this.scene.background = new THREE.Color(0xf4f6f9);
    this.scene.fog = new THREE.FogExp2(0xf4f6f9, 0.025);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 4, 10);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.canvasWrapper.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.post = new PostProcessingManager(
      this.renderer,
      this.scene,
      this.camera,
    );
    this.perf = new PerformanceMonitor();
  }

  initStageLights() {
    // Warm bright studio lighting
    this.ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.dirLight = new THREE.DirectionalLight(0xffa800, 1.8); // Citrus sunlight
    this.dirLight.position.set(5, 12, 8);
    this.dirLight.castShadow = true;

    this.accentLight = new THREE.PointLight(0xff4500, 2.5, 15); // Vibrant orange glow
    this.accentLight.position.set(-5, 2, -5);

    // Light studio floor receiving soft crisp shadows
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xe8ecf2, roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;

    this.scene.add(this.ambient, this.dirLight, this.accentLight, floor);
  }

  initGizmos() {
    this.gizmo = new TransformControls(this.camera, this.renderer.domElement);
    this.gizmo.size = 0.7;
    this.gizmo.addEventListener(
      "dragging-changed",
      (e) => (this.controls.enabled = !e.value),
    );
    this.scene.add(this.gizmo);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener("click", (e) => {
      if (e.target.tagName !== "CANVAS") return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const hits = raycaster.intersectObjects(this.scene.children, true);
      const p = hits.find(
        (h) =>
          h.object.type === "Mesh" &&
          !h.object.parent.isTransformControls &&
          h.object.geometry.type !== "PlaneGeometry",
      );

      if (p) this.gizmo.attach(p.object);
      else this.gizmo.detach();
    });
  }

  routeLab(labKey) {
    this.gizmo.detach();
    if (this.activeModule) this.activeModule.destroy();
    if (this.gui) this.gui.destroy();

    if (window.lil && window.lil.GUI && this.guiDom) {
      this.guiDom.innerHTML = "";
      this.gui = new window.lil.GUI({ container: this.guiDom });
    }

    const tEl = document.getElementById("info-title");
    const dEl = document.getElementById("info-description");

    switch (labKey) {
      case "materials":
        if (tEl) tEl.textContent = "Dielectric Glass";
        if (dEl)
          dEl.textContent =
            "Real-time calculations of transmission and sub-surface ruby ray refractions.";
        this.activeModule = new MaterialLab(this.scene);
        break;
      case "particles":
        if (tEl) tEl.textContent = "Citrus Particle Fields";
        if (dEl)
          dEl.textContent =
            "40,000 warm glowing orange coordinates calculated on a single draw call.";
        this.activeModule = new ParticleLab(this.scene);
        break;
      case "shaders":
        if (tEl) tEl.textContent = "Raw GLSL Pipeline";
        if (dEl)
          dEl.textContent =
            "Custom vertex transforms and vibrant orange procedural fragment math.";
        this.activeModule = new ShaderLab(this.scene);
        break;
      case "configurator":
        if (tEl) tEl.textContent = "Interactive Configurator";
        if (dEl)
          dEl.textContent =
            "Explore the Hermès concept hierarchy featuring multi-axis explosion animations.";
        this.activeModule = new ConfiguratorLab(this.scene);
        break;
      case "showcase":
        if (tEl) tEl.textContent = "Awwwards Light Showcase";
        if (dEl)
          dEl.textContent =
            "Combining calibrated post-processing bloom, physical refractions, and citrus lighting.";
        this.activeModule = new ShowcaseLab(this.scene);
        break;
      case "geometry":
      default:
        if (tEl) tEl.textContent = "Parametric Geometries";
        if (dEl)
          dEl.textContent =
            "Mathematical vertex allocations in Hermès Orange. Change detail via the panel.";
        this.activeModule = new GeometryLab(this.scene);
        break;
    }

    if (
      this.activeModule &&
      typeof this.activeModule.populateGUI === "function" &&
      this.gui
    ) {
      this.activeModule.populateGUI(this.gui);
    }

    gsap.fromTo(
      ".info-overlay",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4 },
    );
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.post.resize(window.innerWidth, window.innerHeight);
    });

    document.querySelectorAll(".app-nav .nav-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        document
          .querySelectorAll(".app-nav .nav-btn")
          .forEach((x) => x.classList.remove("active"));
        e.target.classList.add("active");
        this.routeLab(e.target.dataset.section || "geometry");
      });
    });

    document.querySelectorAll(".gizmo-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        document
          .querySelectorAll(".gizmo-btn")
          .forEach((x) => x.classList.remove("active"));
        e.target.classList.add("active");
        this.gizmo.setMode(e.target.dataset.mode);
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "w") {
        this.gizmo.setMode("translate");
      }
      if (e.key === "e") {
        this.gizmo.setMode("rotate");
      }
      if (e.key === "r") {
        this.gizmo.setMode("scale");
      }
      if (e.key === "Escape") {
        const l = document.getElementById("loader-screen");
        if (l) l.style.display = "none";
      }
    });
  }

  dismissLoader() {
    const p = document.getElementById("loader-progress");
    gsap.to(p, {
      width: "100%",
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to("#loader-screen", {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            const l = document.getElementById("loader-screen");
            if (l) l.style.display = "none";
            this.routeLab("geometry");
            this.renderLoop();
          },
        });
      },
    });
  }

  renderLoop() {
    requestAnimationFrame(() => this.renderLoop());

    this.controls.update();

    if (this.activeModule && typeof this.activeModule.update === "function") {
      this.activeModule.update();
    }

    const t = performance.now() * 0.001;
    this.accentLight.position.x = Math.sin(t) * 6;
    this.accentLight.position.z = Math.cos(t) * 6;

    this.post.render();
    this.perf.update(this.renderer);
  }
}

// Kickstart ES Module Light Application
window.addEventListener("DOMContentLoaded", () => {
  new MasterLaboratoryApp();
});
