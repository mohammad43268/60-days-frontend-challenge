const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const cursor = document.getElementById("cursor");

window.addEventListener("mousemove", (e) => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
  cursor.classList.remove("hidden");
});

document.addEventListener("mouseleave", () => {
  cursor.classList.add("hidden");
});

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    cursor.classList.add("active");
    cursor.innerHTML = "Drink";
  });
  item.addEventListener("mouseleave", () => {
    cursor.classList.remove("active");
    cursor.innerHTML = "";
  });
});

document.querySelectorAll(".magnetic, .menu-link a").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    cursor.classList.add("active-link");
  });
  item.addEventListener("mouseleave", () => {
    cursor.classList.remove("active-link");
  });
});

const magneticElements = document.querySelectorAll(".magnetic");
magneticElements.forEach((elem) => {
  elem.addEventListener("mousemove", (e) => {
    const rect = elem.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(elem, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 0.3,
      ease: "power2.out",
    });
  });
  elem.addEventListener("mouseleave", () => {
    gsap.to(elem, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });
});

const menuBtn = document.getElementById("menu-btn");
const fullMenu = document.getElementById("full-menu");
let isMenuOpen = false;

menuBtn.addEventListener("click", () => {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    menuBtn.innerText = "CLOSE";
    gsap.to(fullMenu, { y: "0%", duration: 0.8, ease: "expo.inOut" });
    gsap.to(".menu-link", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "expo.out",
      delay: 0.4,
    });
  } else {
    menuBtn.innerText = "MENU";
    gsap.to(".menu-link", {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: -0.05,
      ease: "power2.in",
    });
    gsap.to(fullMenu, {
      y: "-100%",
      duration: 0.8,
      ease: "expo.inOut",
      delay: 0.3,
    });
  }
});

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const frames = { currentIndex: 0, maxIndex: 382 };
let imagesLoaded = 0;
const images = [];

function preloadImages() {
  for (let i = 1; i <= frames.maxIndex; i++) {
    const imageUrl = `./frames/frame_${i.toString().padStart(4, "0")}.jpg`;
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === frames.maxIndex) {
        loadImage(frames.currentIndex);
        startAnimation();
      }
    };
    img.onerror = () => {
      imagesLoaded++;
      if (imagesLoaded === frames.maxIndex) {
        loadImage(frames.currentIndex);
        startAnimation();
      }
    };
    images.push(img);
  }
}

function loadImage(index) {
  if (index >= 0 && index < frames.maxIndex) {
    const img = images[index];
    const dpr = window.devicePixelRatio || 1;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (
      canvas.width !== windowWidth * dpr ||
      canvas.height !== windowHeight * dpr
    ) {
      canvas.width = windowWidth * dpr;
      canvas.height = windowHeight * dpr;
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowHeight}px`;
      context.scale(dpr, dpr);
    }

    const scaleX = windowWidth / img.width;
    const scaleY = windowHeight / img.height;
    const scale = Math.max(scaleX, scaleY);

    const newWidth = img.width * scale;
    const newHeight = img.height * scale;
    const offsetX = (windowWidth - newWidth) / 2;
    const offsetY = (windowHeight - newHeight) / 2;

    context.clearRect(0, 0, windowWidth, windowHeight);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  }
}

function startAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.set(".step-1", { opacity: 1 });
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".parent",
      start: "top top",
      end: "+=5000",
      scrub: 1,
      pin: ".canvas-container",
    },
  });

  tl.to(
    frames,
    {
      currentIndex: frames.maxIndex - 1,
      snap: "currentIndex",
      ease: "none",
      onUpdate: function () {
        loadImage(Math.floor(frames.currentIndex));
      },
    },
    0,
  );

  tl.to(".step-1", { opacity: 0, y: -50, duration: 0.1 }, 0.1)
    .fromTo(
      ".step-2",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.1 },
      0.25,
    )
    .to(".step-2", { opacity: 0, y: -50, duration: 0.1 }, 0.5)
    .to(".step-3", { opacity: 1, duration: 0.01 }, 0.65)
    .fromTo(
      ".glow-orb",
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.15 },
      0.65,
    )
    .fromTo(
      ".bento-grid .glass-card",
      { opacity: 0, scale: 0.8, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 0.15, stagger: 0.03 },
      0.68,
    )
    .fromTo(
      ".step-3-content span",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.1 },
      0.72,
    )
    .fromTo(
      ".step-3-content h1",
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.15 },
      0.75,
    )
    .fromTo(
      ".step-3-content p",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.1 },
      0.8,
    );

  gsap.from(".overlap-card", {
    y: 100,
    scrollTrigger: {
      trigger: ".next-section",
      start: "top bottom",
      end: "top center",
      scrub: true,
    },
  });

  let panels = gsap.utils.toArray(".panel");
  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-scroll-wrapper",
      pin: true,
      scrub: 1,
      end: () =>
        "+=" +
        document.querySelector(".horizontal-scroll-wrapper").offsetWidth *
          (panels.length - 1),
    },
  });

  gsap.to(".track-left", {
    xPercent: -50,
    ease: "none",
    duration: 40,
    repeat: -1,
  });

  gsap.fromTo(
    ".track-right",
    { xPercent: -50 },
    { xPercent: 0, ease: "none", duration: 40, repeat: -1 },
  );

  gsap.to(".marquee-track", {
    xPercent: -50,
    ease: "none",
    duration: 25,
    repeat: -1,
  });
}

window.addEventListener("resize", () => {
  if (imagesLoaded === frames.maxIndex) {
    loadImage(Math.floor(frames.currentIndex));
  }
});

preloadImages();
