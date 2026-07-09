import "./index.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger, Draggable);

function splitTextCustom(selector, type = "chars") {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const text = el.innerText;
    el.innerHTML = "";
    if (type === "chars") {
      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.className = "char";
        span.innerHTML = char === " " ? "&nbsp;" : char;
        el.appendChild(span);
      });
    } else {
      text.split(" ").forEach((word) => {
        const span = document.createElement("span");
        span.className = "word";
        span.innerHTML = word + "&nbsp;";
        el.appendChild(span);
      });
    }
  });
}

splitTextCustom(".split-chars", "chars");
splitTextCustom(".split-words", "words");

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0, 0);

// =======================================
// 3. Auto-Hide Navbar (Perfectly Smooth)
// =======================================
const navbar = document.querySelector(".navbar");

// Create a GSAP animation that we can play/reverse on demand
const navAnimation = gsap.to(navbar, {
  yPercent: -100,
  paused: true,
  duration: 0.4,
  ease: "power3.inOut", // Smoother easing curve than CSS
});

ScrollTrigger.create({
  start: "top top",
  end: "max", // Keeps it active for the whole page
  onUpdate: (self) => {
    // self.direction: 1 is scrolling down, -1 is scrolling up
    if (self.direction === 1 && self.scroll() > 50) {
      navAnimation.play(); // Hides nav smoothly
    } else {
      navAnimation.reverse(); // Shows nav smoothly
    }
  },
});

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");
const hoverTargets = document.querySelectorAll(
  ".hover-target, .drag-item, button, a",
);

window.addEventListener("mousemove", (e) => {
  gsap.to(cursorDot, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.1,
    ease: "power2.out",
  });
  gsap.to(cursorOutline, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.5,
    ease: "power2.out",
  });
});

hoverTargets.forEach((target) => {
  target.addEventListener("mouseenter", () =>
    cursorOutline.classList.add("hover"),
  );
  target.addEventListener("mouseleave", () =>
    cursorOutline.classList.remove("hover"),
  );
});

const roles = [
  "Frontend Engineer.",
  "Creative Developer.",
  "UI/UX Designer.",
  "Web Animator.",
];
let roleIndex = 0;
const roleText = document.querySelector(".dynamic-role");

function animateRole() {
  const tl = gsap.timeline();
  tl.to(roleText, {
    y: "-100%",
    opacity: 0,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      roleIndex = (roleIndex + 1) % roles.length;
      roleText.innerText = roles[roleIndex];
    },
  }).fromTo(
    roleText,
    { y: "100%", opacity: 0 },
    { y: "0%", opacity: 1, duration: 0.5, ease: "power2.out" },
  );
  gsap.delayedCall(3, animateRole);
}

gsap.from(".split-chars .char", {
  y: 80,
  opacity: 0,
  rotationZ: 5,
  duration: 1,
  ease: "power4.out",
  stagger: 0.03,
  delay: 0.2,
});

gsap.from(".reveal-fade", {
  y: 30,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  ease: "power3.out",
  delay: 1.2,
});

gsap.delayedCall(2.5, animateRole);

const portalTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-about-wrapper",
    start: "top top",
    end: "+=300%",
    pin: true,
    scrub: 1,
  },
});

portalTl
  .to(
    ".spline-bg",
    {
      scale: 5,
      opacity: 0,
      ease: "power2.inOut",
    },
    0,
  )
  .to(
    ".hero-content",
    {
      scale: 1.2,
      y: -50,
      opacity: 0,
      ease: "power2.in",
    },
    0,
  );

portalTl.to(
  ".about",
  {
    clipPath: "circle(150% at 50% 50%)",
    ease: "power2.inOut",
    onStart: () => gsap.set(".about", { pointerEvents: "auto" }),
    onReverseComplete: () => gsap.set(".about", { pointerEvents: "none" }),
  },
  0.2,
);

portalTl.fromTo(
  ".about-spline",
  { scale: 0.8, opacity: 0 },
  { scale: 1, opacity: 1, ease: "power2.out" },
  0.2,
);

portalTl
  .fromTo(
    ".about-text",
    { opacity: 0, x: 50 },
    { opacity: 1, x: 0, ease: "power2.out" },
    0.6,
  )
  .fromTo(
    ".about-desc .word",
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.02, ease: "power3.out" },
    0.7,
  );

gsap.to(".strand-a", {
  y: (i) => Math.sin(i * 0.6) * 15,
  duration: 2.5,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
  stagger: 0.15,
});

gsap.to(".floating-img", {
  y: (i) => Math.sin(i) * 20,
  rotation: (i) => Math.sin(i) * 3,
  duration: 3,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
  stagger: 0.2,
});

const cards = gsap.utils.toArray(".stack-card");
cards.forEach((card, index) => {
  if (index === cards.length - 1) return;
  gsap.to(card, {
    scale: 0.9,
    opacity: 0.5,
    scrollTrigger: {
      trigger: cards[index + 1],
      start: "top 70%",
      end: "top 15%",
      scrub: true,
    },
  });
});

const images = gsap.utils.toArray(".drag-item");
const container = document.querySelector(".drag-container");
const alignBtn = document.getElementById("align-btn");

images.forEach((img) => {
  gsap.set(img, {
    x: Math.random() * (container.offsetWidth - 250),
    y: Math.random() * (container.offsetHeight - 350),
    rotation: Math.random() * 30 - 15,
  });
});

Draggable.create(".drag-item", { bounds: ".drag-container", inertia: false });

alignBtn.addEventListener("click", () => {
  const cols = 3,
    padding = 20,
    imgWidth = 250,
    imgHeight = 350;
  const startX =
    (container.offsetWidth - (imgWidth * cols + padding * (cols - 1))) / 2;
  const startY = 50;

  images.forEach((img, i) => {
    gsap.to(img, {
      x: startX + (i % cols) * (imgWidth + padding),
      y: startY + Math.floor(i / cols) * (imgHeight + padding),
      rotation: 0,
      duration: 1,
      ease: "power3.inOut",
    });
  });
});

gsap.from(".social-icon", {
  scrollTrigger: { trigger: ".footer-cta-content", start: "top 80%" },
  y: 50,
  opacity: 0,
  scale: 0.5,
  duration: 0.8,
  stagger: 0.1,
  ease: "back.out(1.5)",
});

document.querySelectorAll(".magnetic").forEach((elem) => {
  elem.addEventListener("mousemove", (e) => {
    const rect = elem.getBoundingClientRect();
    gsap.to(elem, {
      x: (e.clientX - rect.left - rect.width / 2) * 0.4,
      y: (e.clientY - rect.top - rect.height / 2) * 0.4,
      duration: 0.8,
      ease: "power3.out",
    });
  });

  elem.addEventListener("mouseleave", () => {
    gsap.to(elem, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
  });
});
// Pause Spline viewers when out of view
const splineViewers = document.querySelectorAll("spline-viewer");

const splineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // Spline viewer components have native play/pause methods
      if (entry.isIntersecting) {
        entry.target.play();
      } else {
        entry.target.pause();
      }
    });
  },
  { threshold: 0 },
); // Triggers as soon as 1 pixel enters/leaves

splineViewers.forEach((viewer) => splineObserver.observe(viewer));
