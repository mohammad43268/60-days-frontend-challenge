gsap.registerPlugin(ScrollTrigger);

// --- 1. CORE UTILS & CURSOR ---
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

const cursor = document.querySelector(".cursor");
let mouseX = window.innerWidth / 2,
  mouseY = window.innerHeight / 2;
let cursorX = mouseX,
  cursorY = mouseY;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.querySelectorAll(".hover-trigger").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});

// --- 2. SMOOTH SCROLL (LENIS) ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

// --- 3. VELOCITY DRAG SLIDER ---
const track = document.querySelector(".slider-track");
const slideImgs = document.querySelectorAll(".slide-img");
let currX = 0,
  targetX = 0,
  isDrag = false,
  startX = 0;

document.querySelector(".slider-bounds").addEventListener("mousedown", (e) => {
  isDrag = true;
  startX = e.clientX - targetX;
  cursor.classList.add("hover");
});
window.addEventListener("mouseup", () => {
  isDrag = false;
  cursor.classList.remove("hover");
});
window.addEventListener("mousemove", (e) => {
  if (!isDrag) return;
  targetX = e.clientX - startX;
  const maxDrag = -(track.scrollWidth - window.innerWidth + 100);
  if (targetX > 0) targetX = 0;
  if (targetX < maxDrag) targetX = maxDrag;
});

// GLOBAL RAF LOOP
function raf(time) {
  lenis.raf(time);

  // Smooth Cursor
  cursorX = lerp(cursorX, mouseX, 0.15);
  cursorY = lerp(cursorY, mouseY, 0.15);
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

  // Slider Velocity Skew
  const prevX = currX;
  currX = lerp(currX, targetX, 0.08);
  const velocity = currX - prevX;
  track.style.transform = `translate3d(${currX}px, 0, 0)`;

  slideImgs.forEach((img) => {
    let skew = gsap.utils.clamp(-12, 12, velocity * -0.1);
    img.style.transform = `skewX(${skew}deg)`;
  });

  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 4. INITIALIZATION & SVG REVEALS ---
document.fonts.ready.then(() => {
  const splitTargets = document.querySelectorAll(".split-target");
  splitTargets.forEach(
    (el) => new SplitType(el, { types: "lines, words", tagName: "span" }),
  );

  const tlLoader = gsap.timeline();
  const counter = { val: 0 };

  // Reset starting states
  gsap.set(".line-inner", { yPercent: 120 });
  gsap.set(".visual-mask", { clipPath: "inset(100% 0 0 0)" });
  gsap.set(".hero-img", { scale: 1.2 });
  gsap.set(".split-target .word", { y: 30, opacity: 0 });
  gsap.set(".studio-badge", { scale: 0, rotation: -90 });

  tlLoader
    .to(counter, {
      val: 100,
      duration: 1.5,
      ease: "power3.inOut",
      onUpdate: () =>
        (document.querySelector(".loader-counter").innerText = Math.round(
          counter.val,
        )),
    })
    .to(
      ".loader-bar",
      { width: "100%", duration: 1.5, ease: "power3.inOut" },
      0,
    )

    // Animate SVG Registration Marks drawing in
    .to(
      ".reg-path",
      { strokeDashoffset: 0, duration: 1.5, ease: "expo.inOut" },
      0.5,
    )

    .to(
      ".loader",
      { yPercent: -100, duration: 1.2, ease: "expo.inOut" },
      "+=0.2",
    )

    // Reveal Hero Image
    .to(
      ".visual-mask",
      { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.out" },
      "-=0.8",
    )
    .to(".hero-img", { scale: 1, duration: 1.6, ease: "expo.out" }, "-=1.6")

    // Pop in the SVG Studio Badge
    .to(
      ".studio-badge",
      { scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.5)" },
      "-=1.0",
    )

    // Reveal Hero Text
    .to(
      ".line-inner",
      { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" },
      "-=1.2",
    )
    .to(
      ".split-target .word",
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: "power2.out" },
      "-=1.0",
    );
});

// --- 5. THE DYNAMIC ASYMMETRICAL CYLINDER (14 UNIQUE IMAGES) ---
const cylStage = document.querySelector(".cylinder-stage");
const cylImages = [
  "https://i.pinimg.com/736x/76/f9/f4/76f9f41f13ac5ecc505817a6e9c8a4a3.jpg",
  "https://i.pinimg.com/736x/8c/16/b3/8c16b362671b8361c7112e908918956f.jpg",
  "https://i.pinimg.com/736x/8a/6c/5e/8a6c5e78d507849be895b5e94a1cffad.jpg",
  "https://i.pinimg.com/736x/17/bc/2f/17bc2fbf0747fe00e06d7fa37ce97cf5.jpg",
  "https://i.pinimg.com/736x/3c/4f/b8/3c4fb8479515f30cf14e5368518d5285.jpg",
  "https://i.pinimg.com/736x/93/bc/35/93bc35a1a42425a732c8452cb0d87123.jpg",
  "https://i.pinimg.com/736x/3c/97/6b/3c976b927bf364653da6474ad3d733e4.jpg",
  "https://i.pinimg.com/736x/31/c1/63/31c163d24664731d8c6636a91a335a61.jpg",
  "https://i.pinimg.com/736x/67/62/b3/6762b3ece140e1fc853e92f2edfeaa42.jpg",
  "https://i.pinimg.com/1200x/54/c0/8f/54c08fb50ab4514908b2cf1b93282b9b.jpg",
  "https://i.pinimg.com/736x/99/a4/22/99a422940a8d31e08b2ce480a9936916.jpg",
  "https://i.pinimg.com/736x/77/d4/50/77d450c5ba8abd0b2d4f17619cb8101a.jpg",
  "https://i.pinimg.com/1200x/a1/81/3a/a1813aa67a3bccd02176dbca9d70ba95.jpg",
  "https://i.pinimg.com/736x/62/98/e8/6298e8b596a74b17e50854615ce6cfb8.jpg",
];

const numItems = cylImages.length;
const radius = 600;

cylImages.forEach((src, i) => {
  const angle = (i / numItems) * Math.PI * 2;

  // Dynamic sizes so they look like scattered editorial posters
  const randomWidth = gsap.utils.random(220, 350);
  const randomHeight = gsap.utils.random(300, 480);

  // Stagger heights so they interlock dynamically
  const randomY = gsap.utils.random(-150, 150);

  const item = document.createElement("div");
  item.className = "cyl-item";

  item.style.width = `${randomWidth}px`;
  item.style.height = `${randomHeight}px`;
  item.innerHTML = `<img src="${src}">`;

  gsap.set(item, {
    xPercent: -50,
    yPercent: -50,
    x: Math.sin(angle) * radius,
    y: randomY,
    z: Math.cos(angle) * radius,
    rotationY: (angle * 180) / Math.PI,
  });

  cylStage.appendChild(item);
});

// Scroll Triggers for Cylinder
gsap.to(cylStage, {
  rotationY: -360,
  ease: "none",
  scrollTrigger: {
    trigger: "#sec-2",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
  },
});
gsap.to(".archive-bg-text", {
  xPercent: -50,
  ease: "none",
  scrollTrigger: {
    trigger: "#sec-2",
    start: "top bottom",
    end: "bottom top",
    scrub: 1.5,
  },
});

// --- 6. PARALLAX & GRID REVEALS ---
gsap.utils.toArray(".parallax-img").forEach((img) => {
  gsap.to(img, {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: img.parentElement,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
});

gsap.utils.toArray(".mask-reveal").forEach((item) => {
  gsap.fromTo(
    item,
    { clipPath: "inset(100% 0 0 0)" },
    {
      clipPath: "inset(0% 0 0 0)",
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: { trigger: item, start: "top 80%" },
    },
  );
});

// --- 7. MARQUEE ---
let dir = 1;
gsap.to(".marquee", { xPercent: -50, ease: "none", duration: 10, repeat: -1 });
ScrollTrigger.create({
  onUpdate: (self) => {
    if (self.direction !== dir) {
      dir = self.direction;
      gsap.to(".marquee", {
        xPercent: dir === 1 ? -50 : 0,
        duration: 10,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
    }
  },
});

// Optional: Parallax the SVG registration marks slightly on scroll
gsap.to(".reg-mark", {
  y: 50,
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
});
