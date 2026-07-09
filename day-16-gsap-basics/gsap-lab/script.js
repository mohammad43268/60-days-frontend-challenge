gsap.registerPlugin(ScrollTrigger);

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

const heroTl = gsap.timeline({ paused: true });

let progress = 0;
const progressEl = document.getElementById("progress");

const interval = setInterval(() => {
  progress += Math.floor(Math.random() * 10) + 1;
  if (progress > 100) progress = 100;
  if (progressEl) progressEl.innerText = progress;

  if (progress === 100) {
    clearInterval(interval);
    gsap.to(".preloader", {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      onComplete: () => {
        heroTl.play();
      },
    });
  }
}, 150);

const cursor = document.querySelector(".custom-cursor");
const glow = document.querySelector(".mouse-glow");

let targetX = 0;
let targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  uColor1: { value: new THREE.Color("#090909") },
  uColor2: { value: new THREE.Color("#ff5f1f") },
};

if (cursor && glow) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  gsap.set(glow, { xPercent: -50, yPercent: -50 });

  const xToCursor = gsap.quickTo(cursor, "x", {
    duration: 0.2,
    ease: "power3.out",
  });
  const yToCursor = gsap.quickTo(cursor, "y", {
    duration: 0.2,
    ease: "power3.out",
  });
  const xToGlow = gsap.quickTo(glow, "x", {
    duration: 0.6,
    ease: "power3.out",
  });
  const yToGlow = gsap.quickTo(glow, "y", {
    duration: 0.6,
    ease: "power3.out",
  });

  document.addEventListener("mousemove", (e) => {
    xToCursor(e.clientX);
    yToCursor(e.clientY);
    xToGlow(e.clientX);
    yToGlow(e.clientY);

    targetX = (e.clientX - windowHalfX) * 0.002;
    targetY = (e.clientY - windowHalfY) * 0.002;

    uniforms.uMouse.value.x = e.clientX / window.innerWidth;
    uniforms.uMouse.value.y = 1.0 - e.clientY / window.innerHeight;

    if (
      e.target.closest(
        "a, button, input, .project-card, .h-slide, .circle-text, svg",
      )
    ) {
      cursor.classList.add("hover");
    } else {
      cursor.classList.remove("hover");
    }
  });
}

const stringSvg = document.querySelector(".hero-line");
if (stringSvg) {
  const pathEl = stringSvg.querySelector("path");
  const finalPath = "M 10 100 Q 500 100 990 100";

  stringSvg.addEventListener("mousemove", function (e) {
    const rect = stringSvg.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const svgX = (relX / rect.width) * 1000;
    const svgY = (relY / rect.height) * 200;
    const newPath = `M 10 100 Q ${svgX} ${svgY} 990 100`;

    gsap.to(pathEl, {
      attr: { d: newPath },
      duration: 0.5,
      ease: "power3.out",
    });
  });

  stringSvg.addEventListener("mouseleave", function () {
    gsap.to(pathEl, {
      attr: { d: finalPath },
      duration: 1.5,
      ease: "elastic.out(1, 0.2)",
    });
  });
}

document.querySelectorAll(".split-chars").forEach((el) => {
  const text = el.innerText;
  el.innerHTML = text
    .split("")
    .map(
      (char) =>
        `<span class="char" style="opacity:0; transform:translateY(100px); display:inline-block;">${char === " " ? "&nbsp;" : char}</span>`,
    )
    .join("");
});

document.querySelectorAll(".split-words").forEach((el) => {
  const words = el.innerText.split(" ");
  el.innerHTML = words
    .map(
      (word) =>
        `<span class="word" style="opacity:0; transform:translateY(50px); display:inline-block;">${word}</span>`,
    )
    .join(" ");
});

heroTl
  .to(".hero .char", {
    y: 0,
    opacity: 1,
    stagger: 0.05,
    duration: 1.2,
    ease: "power4.out",
    delay: 0.2,
  })
  .from(
    ".hero-line",
    {
      strokeDasharray: 1000,
      strokeDashoffset: 1000,
      duration: 1.5,
      ease: "power3.inOut",
    },
    "-=0.8",
  )
  .from(
    ".hero-sub p",
    {
      y: 20,
      opacity: 0,
      duration: 1,
    },
    "-=1",
  );

gsap.to(".showreel-container", {
  scale: 1,
  borderRadius: "0px",
  width: "100vw",
  height: "100vh",
  scrollTrigger: {
    trigger: ".showreel-section",
    start: "top bottom",
    end: "center center",
    scrub: 1,
  },
});

const storyTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".story-section",
    start: "top top",
    end: "+=150%",
    scrub: 1,
    pin: true,
  },
});

storyTl.to(".story-text .word", {
  y: 0,
  opacity: 1,
  stagger: 0.1,
  ease: "power2.out",
});

gsap.utils.toArray(".parallax-img-box").forEach((img) => {
  const speed = img.getAttribute("data-speed");
  gsap.to(img, {
    y: () => -200 * speed,
    scrollTrigger: {
      trigger: ".story-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
});

const horizontalSections = gsap.utils.toArray(".h-slide");
if (horizontalSections.length > 0) {
  gsap.to(horizontalSections, {
    xPercent: -100 * (horizontalSections.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-scroll",
      pin: true,
      scrub: 1,
      snap: 1 / (horizontalSections.length - 1),
      end: () =>
        "+=" + document.querySelector(".horizontal-container").offsetWidth,
    },
  });
}

gsap.to(".cube", {
  rotateX: 360,
  rotateY: 360,
  rotateZ: 90,
  ease: "none",
  scrollTrigger: {
    trigger: ".cube-section",
    start: "top bottom",
    end: "bottom top",
    scrub: 3,
  },
});

gsap.to(".svg-blob", {
  rotate: 360,
  scale: 1.1,
  transformOrigin: "center center",
  repeat: -1,
  yoyo: true,
  duration: 10,
  ease: "sine.inOut",
});

gsap.to(".svg-blob", {
  scrollTrigger: {
    trigger: ".svg-section",
    start: "top bottom",
    end: "bottom top",
    scrub: true,
  },
  y: 150,
  scale: 1.4,
});

gsap.utils.toArray(".m-item").forEach((item) => {
  ScrollTrigger.create({
    trigger: item,
    start: "top 85%",
    onEnter: () => item.classList.add("clear"),
    onLeaveBack: () => item.classList.remove("clear"),
  });
});

gsap.to(".marquee-inner", {
  xPercent: -50,
  ease: "none",
  duration: 12,
  repeat: -1,
});

const magnetics = document.querySelectorAll(".magnetic");
magnetics.forEach((btn) => {
  const wrap = btn.closest(".magnetic-wrap") || btn;

  wrap.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
    gsap.to(btn, { x: x, y: y, duration: 0.5, ease: "power2.out" });
  });

  wrap.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
  });
});

const heroSection = document.getElementById("home");
if (typeof THREE !== "undefined" && heroSection) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "1";
  renderer.domElement.style.pointerEvents = "none";

  heroSection.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(2.5, 128, 128);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec2 uMouse;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      float displacement = sin(pos.x * 2.0 + uTime) * sin(pos.y * 2.0 + uTime) * sin(pos.z * 2.0 + uTime);
      pos += normal * (displacement * 0.3);
      
      float dist = distance(uv, uMouse);
      pos += normal * (smoothstep(0.5, 0.0, dist) * 0.5);

      vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
      gl_Position = projectionMatrix * vec4(vPosition, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uTime;

    void main() {
      vec3 viewDirection = normalize(-vPosition);
      float fresnel = clamp(1.0 - dot(viewDirection, vNormal), 0.0, 1.0);
      fresnel = pow(fresnel, 3.0);

      float mixValue = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
      vec3 finalColor = mix(uColor1, uColor2, mixValue);
      
      finalColor += vec3(1.0, 0.4, 0.1) * fresnel * 1.5;

      gl_FragColor = vec4(finalColor, clamp(fresnel * 1.5 + 0.1, 0.0, 1.0));
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    wireframe: true,
  });

  const shape = new THREE.Mesh(geometry, material);
  scene.add(shape);

  camera.position.z = 6;

  const clock = new THREE.Clock();

  function animate3D() {
    uniforms.uTime.value = clock.getElapsedTime();

    shape.rotation.x += 0.05 * (targetY - shape.rotation.x);
    shape.rotation.y += 0.05 * (targetX - shape.rotation.y);

    shape.rotation.y += 0.002;
    shape.position.y = Math.sin(uniforms.uTime.value * 0.5) * 0.3;

    renderer.render(scene, camera);
  }

  gsap.ticker.add(animate3D);

  window.addEventListener("resize", () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
