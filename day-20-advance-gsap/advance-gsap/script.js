gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin, ScrollToPlugin);

// ==========================================
// 1. LENIS TICKER "HOLY GRAIL" SYNC
// ==========================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 2. MAGNETIC VIEW CURSOR & SHERY SETUP
// ==========================================
Shery.mouseFollower({
  skew: true,
  ease: "cubic-bezier(0.23, 1, 0.320, 1)",
  duration: 0.5,
});
Shery.makeMagnet(".magnet-target", {
  ease: "cubic-bezier(0.23, 1, 0.320, 1)",
  duration: 1,
});

const viewCursor = document.getElementById("viewCursor");
const xTo = gsap.quickTo(viewCursor, "left", {
  duration: 0.15,
  ease: "power3",
});
const yTo = gsap.quickTo(viewCursor, "top", { duration: 0.15, ease: "power3" });

window.addEventListener("mousemove", (e) => {
  xTo(e.clientX);
  yTo(e.clientY);
});

// Suppress Shery dot when entering View photos
document.querySelectorAll(".hover-view").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    viewCursor.classList.add("active");
    gsap.to(".mousefollower", { opacity: 0, duration: 0.15 });
  });
  item.addEventListener("mouseleave", () => {
    viewCursor.classList.remove("active");
    gsap.to(".mousefollower", { opacity: 1, duration: 0.15 });
  });
});

// ==========================================
// 3. THREE.JS SCENE SETUP
// ==========================================
const counterEl = document.getElementById("counterEl");
const lineEl = document.getElementById("lineEl");
const canvas = document.querySelector("#webgl-canvas");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 1.5, 12);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
keyLight.position.set(0, 10, 5);
scene.add(keyLight);
const leftRim = new THREE.DirectionalLight(0x0077ff, 2.5);
leftRim.position.set(-10, 2, -3);
scene.add(leftRim);
const rightFill = new THREE.DirectionalLight(0xffaa00, 1.8);
rightFill.position.set(10, 1, 2);
scene.add(rightFill);

let masterCarGroup = new THREE.Group();
scene.add(masterCarGroup);

let carModel = null;
const loader = new THREE.GLTFLoader();

loader.load(
  "./land-rover-defender-110/source/2021+Land+Rover+Defender+110.glb",
  (gltf) => {
    carModel = gltf.scene;

    const rawBox = new THREE.Box3().setFromObject(carModel);
    const maxDim = Math.max(...rawBox.getSize(new THREE.Vector3()).toArray());
    carModel.scale.setScalar(12 / maxDim);

    const newBox = new THREE.Box3().setFromObject(carModel);
    const center = newBox.getCenter(new THREE.Vector3());
    const size = newBox.getSize(new THREE.Vector3());
    carModel.position.set(-center.x, -newBox.min.y - 1.4, -center.z);
    carModel.rotation.y = 0;

    const sphere = newBox.getBoundingSphere(new THREE.Sphere());
    const fovRad = (camera.fov * Math.PI) / 180;
    const horizontalFov = 2 * Math.atan(Math.tan(fovRad / 2) * camera.aspect);
    const fitDist =
      (sphere.radius / Math.sin(Math.min(fovRad, horizontalFov) / 2)) * 0.85;

    camera.position.set(fitDist * 0.18, size.y * 0.38, fitDist);
    camera.lookAt(0, size.y * 0.28, 0);
    camera.updateProjectionMatrix();

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext("2d");
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, "rgba(0, 0, 0, 0.85)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 6),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(shadowCanvas),
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = carModel.position.y - 0.01;
    scene.add(shadowMesh);

    masterCarGroup.add(carModel);

    gsap.to(lineEl, { scaleX: 1, duration: 0.4, ease: "power2.out" });
    counterEl.textContent = "100%";
    setTimeout(initAnimations, 600);
  },
  (xhr) => {
    if (xhr.total > 0) {
      const p = Math.min((xhr.loaded / xhr.total) * 100, 100);
      counterEl.textContent = Math.floor(p) + "%";
      gsap.to(lineEl, { scaleX: p / 100, duration: 0.1, overwrite: "auto" });
    }
  },
  (err) => console.error(err),
);

function initAnimations() {
  gsap
    .timeline({ onComplete: () => ScrollTrigger.refresh() })
    .to(".loader", { yPercent: -100, duration: 1.2, ease: "power4.inOut" })
    .fromTo(
      carModel.position,
      { z: -18 },
      { z: 0, duration: 3.5, ease: "expo.out" },
      "-=0.8",
    )
    .from(
      ".hero-text",
      { y: 40, opacity: 0, duration: 1.5, stagger: 0.1, ease: "expo.out" },
      "-=2.2",
    );

  gsap.utils.toArray(".reveal-text").forEach((t) => {
    gsap.fromTo(
      t,
      { y: 40, opacity: 0 },
      {
        scrollTrigger: {
          trigger: t,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      },
    );
  });
  gsap.fromTo(
    ".img-1",
    { x: -100, opacity: 0 },
    {
      scrollTrigger: { trigger: ".s-about", start: "top 60%" },
      x: 0,
      opacity: 1,
      duration: 1.5,
    },
  );
  gsap.fromTo(
    ".img-2",
    { y: 100, opacity: 0 },
    {
      scrollTrigger: { trigger: ".s-about", start: "top 50%" },
      y: 0,
      opacity: 1,
      duration: 1.5,
    },
  );

  gsap.to(carModel.position, {
    scrollTrigger: {
      trigger: ".section2",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    x: 4.5,
    z: -2,
  });
  gsap.to(carModel.rotation, {
    scrollTrigger: {
      trigger: ".section2",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    y: Math.PI / 6,
  });

  gsap.to(carModel.position, {
    scrollTrigger: {
      trigger: ".section3",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    x: -4.5,
    z: -2,
  });
  gsap.to(carModel.rotation, {
    scrollTrigger: {
      trigger: ".section3",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    y: -Math.PI / 6,
  });

  gsap.to(carModel.position, {
    scrollTrigger: {
      trigger: ".section4",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    x: 0,
    y: -2,
    z: -25,
  });
  gsap.to(carModel.rotation, {
    scrollTrigger: {
      trigger: ".section4",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    y: 0,
  });

  gsap.to(carModel.position, {
    scrollTrigger: {
      trigger: ".section6",
      start: "top bottom",
      end: "center center",
      scrub: 1,
    },
    x: 0,
    y: -1.5,
    z: 1.5,
  });
  gsap.to(carModel.position, {
    scrollTrigger: {
      trigger: ".section7",
      start: "top bottom",
      end: "center center",
      scrub: 1,
    },
    x: 0,
    y: -1.8,
    z: -5,
  });

  Draggable.create("#drag-item", { type: "x", bounds: "#drag-container" });
  gsap.fromTo(
    ".g-item",
    { y: 100, opacity: 0 },
    {
      scrollTrigger: { trigger: ".s-gallery", start: "top 70%" },
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
    },
  );

  gsap.set(".path-item", { xPercent: -50, yPercent: -50 });
  gsap.to(".path-item", {
    scrollTrigger: {
      trigger: ".s-path",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
    opacity: 1,
    duration: 0.5,
  });
  gsap.to(".path-item", {
    scrollTrigger: {
      trigger: ".s-path",
      start: "top top",
      end: "+=1200",
      pin: true,
      anticipatePin: 1,
      scrub: 1,
    },
    motionPath: {
      path: "#the-route",
      align: "#the-route",
      autoRotate: true,
      alignOrigin: [0.5, 0.5],
    },
    stagger: 0.1,
    ease: "none",
  });

  // Section 6: Cold Start HUD & Portal Transition
  const startEngineBtn = document.getElementById("start-engine-btn");
  const ignitionUi = document.querySelector(".ignition-ui");

  startEngineBtn.addEventListener("click", function () {
    if (this.disabled) return;
    this.disabled = true;

    gsap.fromTo(
      carModel.position,
      { y: carModel.position.y - 0.06 },
      { y: carModel.position.y, duration: 0.5, ease: "elastic.out(20, 0.1)" },
    );
    gsap.to([leftRim, rightFill], {
      intensity: 5.0,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
    });
    gsap.to(masterCarGroup.position, {
      y: 0.22,
      z: 0.6,
      duration: 2.2,
      ease: "power3.inOut",
    });

    gsap.delayedCall(1.0, () => {
      gsap.to([".section2", ".section3", ".section4", ".section5"], {
        height: 0,
        padding: 0,
        margin: 0,
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          document
            .querySelectorAll(".section2, .section3, .section4, .section5")
            .forEach((s) => (s.style.display = "none"));
        },
      });

      const retGallery = document.getElementById("return-gallery");
      retGallery.style.display = "block";
      gsap.to(retGallery, { opacity: 1, duration: 1.0 });

      const strokeEl = document.getElementById("hero-stroke");
      const taglineEl = document.getElementById("hero-tagline");

      if (strokeEl) {
        gsap.to(strokeEl, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            strokeEl.innerText = "WELCOME HOME";
            gsap.to(strokeEl, { opacity: 1, duration: 0.8 });
          },
        });
      }
      if (taglineEl) {
        gsap.to(taglineEl, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            taglineEl.innerText = "PROVED IN THE WILD.";
            gsap.to(taglineEl, { opacity: 1, duration: 0.8 });
          },
        });
      }

      ScrollTrigger.refresh();
    });

    gsap.to(this, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      onComplete: () => {
        this.style.display = "none";
        const hud = document.createElement("div");
        hud.className = "telemetry-hud";
        hud.innerHTML = `
                    <div class="hud-grid">
                        <div class="hud-stat"><span>POWERTRAIN STATUS</span><strong class="hud-live">SYSTEMS NOMINAL</strong></div>
                        <div class="hud-stat"><span>IDLE RPM</span><strong id="live-rpm">850</strong></div>
                        <div class="hud-stat"><span>TORQUE BIAS</span><strong>50 // 50 LOCKED</strong></div>
                        <div class="hud-stat"><span>RIDE HEIGHT</span><strong>+75MM EXTENDED</strong></div>
                    </div>
                `;
        ignitionUi.appendChild(hud);
        gsap.from(hud, {
          opacity: 0,
          y: 25,
          duration: 0.8,
          ease: "power2.out",
        });

        setInterval(() => {
          const rpm = document.getElementById("live-rpm");
          if (rpm) rpm.innerText = Math.floor(848 + Math.random() * 5);
        }, 180);
      },
    });
  });

  const boxes = gsap.utils.toArray(".engine-box");
  let zIdx = 50;

  Draggable.create("#blueprint-container", {
    type: "x,y",
    bounds: ".blueprint-wrapper",
    edgeResistance: 0.5,
  });
  const cardDrags = Draggable.create(".engine-box", {
    type: "x,y",
    bounds: "#blueprint-container",
    edgeResistance: 0.65,
    onPress: function (e) {
      e.stopPropagation();
      this.target.style.zIndex = ++zIdx;
      gsap.to(this.target, { scale: 1.04, duration: 0.2, borderColor: "#fff" });
    },
    onRelease: function () {
      gsap.to(this.target, {
        scale: 1,
        duration: 0.2,
        borderColor: "rgba(255,255,255,0.25)",
      });
    },
    snap: {
      x: (v) => Math.round(v / 80) * 80,
      y: (v) => Math.round(v / 80) * 80,
    },
  });

  document.getElementById("arrange-btn").addEventListener("click", function () {
    const arrange = this.textContent === "ARRANGE GRID";
    this.textContent = arrange ? "SCATTER COMPONENTS" : "ARRANGE GRID";
    boxes.forEach((b, i) => {
      gsap.to(b, {
        x: arrange
          ? [80, 480, 880, 80, 480, 880][i]
          : [80, 720, 1200, 320, 1600, 880][i],
        y: arrange
          ? [80, 80, 80, 480, 480, 480][i]
          : [240, 80, 400, 720, 160, 640][i],
        duration: 0.8,
        ease: "back.out(1)",
        onUpdate: () => cardDrags[i].update(),
      });
    });
  });
}

function tick() {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
