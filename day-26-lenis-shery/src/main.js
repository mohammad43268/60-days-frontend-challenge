import "./style.css";
import Lenis from "lenis";

window.gsap = gsap;
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

const cursor = document.querySelector(".custom-cursor");
document.addEventListener("mousemove", (e) => {
  gsap.to(cursor, {
    x: e.clientX - 6,
    y: e.clientY - 6,
    duration: 0.1,
    ease: "power2.out",
  });
});

const interactiveElements = document.querySelectorAll(
  "a, .shery-item, spline-viewer",
);
interactiveElements.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    gsap.to(cursor, { scale: 5, duration: 0.3 });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(cursor, { scale: 1, duration: 0.3 });
  });
});

gsap.to(".bg-svg", {
  rotation: 180,
  scale: 1.5,
  ease: "none",
  scrollTrigger: {
    trigger: ".smooth-scroll-wrapper",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  },
});

gsap.to(".spline-wrapper", {
  yPercent: 30,
  scale: 0.85,
  opacity: 0,
  ease: "none",
  scrollTrigger: {
    trigger: ".gallery-section",
    start: "top bottom",
    end: "top 30%",
    scrub: 1,
  },
});

const galleryItems = [
  ".item-1",
  ".item-2",
  ".item-3",
  ".item-4",
  ".item-5",
  ".item-6",
];

galleryItems.forEach((item, index) => {
  let xOffset = index % 2 === 0 ? -100 : 100;
  gsap.from(item, {
    x: xOffset,
    y: 150,
    opacity: 0,
    scrollTrigger: {
      trigger: item,
      start: "top 90%",
      end: "top 40%",
      scrub: 1.5,
    },
  });
});

gsap.to(".pin-wrap", {
  x: "-200vw",
  ease: "none",
  scrollTrigger: {
    trigger: ".pin-section",
    pin: true,
    start: "top top",
    end: "+=250%",
    scrub: 4,
  },
});

Shery.imageEffect(".shery-item", {
  style: 2,
  config: {
    resolutionXY: { value: 100 },
    distortion: { value: true },
    mode: { value: -2 },
    mousemove: { value: 0 },
    speed: { value: 1, range: [0.1, 1], rangep: [1, 10] },
    frequency: { value: 50, range: [1, 800], rangep: [1, 100] },
    angle: { value: 0.5, range: [0, 3.14] },
    waveFactor: { value: 1.4, range: [-3, 3] },
    color: { value: 10245 },
    pixelStrength: { value: 3, range: [-20, 100], rangep: [-20, 20] },
    quality: { value: 5, range: [0, 10] },
    contrast: { value: 1, range: [0, 25] },
    brightness: { value: 1, range: [0, 15] },
    colorExposer: { value: 0.18, range: [-5, 5] },
    strength: { value: 0.2, range: [-40, 40], rangep: [-5, 5] },
    exposer: { value: 8, range: [-100, 200] },
  },
});
