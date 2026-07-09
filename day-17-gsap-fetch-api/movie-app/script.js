gsap.registerPlugin(ScrollTrigger);

function startPreloader() {
  let count = 0;
  const counterElement = document.querySelector(".preloader-counter");
  const preloaderElement = document.querySelector(".preloader");
  const heroLines = document.querySelectorAll(".hero-title .line");

  heroLines.forEach((line) => {
    line.innerHTML = `<span style="display:inline-block; transform:translateY(100%);">${line.innerText}</span>`;
  });

  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 10) + 2;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
      document.body.classList.remove("loading");
      const tl = gsap.timeline();
      tl.to(preloaderElement, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
      })
        .to(
          ".hero-title .line span",
          { y: "0%", duration: 1.2, stagger: 0.1, ease: "power4.out" },
          "-=0.8",
        )
        .add(() => ScrollTrigger.refresh());
      initStaticAnimations();
    }
    if (counterElement) counterElement.innerText = count + "%";
  }, 40);
}

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

function initCursor() {
  if (window.innerWidth <= 768) return;
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorFollower = document.querySelector(".cursor-follower");
  const cursorText = document.querySelector(".cursor-text");
  if (!cursorDot || !cursorFollower) return;

  gsap.set([cursorDot, cursorFollower], { xPercent: -50, yPercent: -50 });
  const xToDot = gsap.quickTo(cursorDot, "x", {
    duration: 0.1,
    ease: "power3",
  });
  const yToDot = gsap.quickTo(cursorDot, "y", {
    duration: 0.1,
    ease: "power3",
  });
  const xToFollower = gsap.quickTo(cursorFollower, "x", {
    duration: 0.5,
    ease: "power3",
  });
  const yToFollower = gsap.quickTo(cursorFollower, "y", {
    duration: 0.5,
    ease: "power3",
  });

  window.addEventListener("mousemove", (e) => {
    xToDot(e.clientX);
    yToDot(e.clientY);
    xToFollower(e.clientX);
    yToFollower(e.clientY);
  });

  document.addEventListener(
    "mouseenter",
    (e) => {
      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains("hover-trigger")
      ) {
        const text = e.target.getAttribute("data-cursor") || "VIEW";
        if (cursorText) cursorText.textContent = text;
        cursorFollower.classList.add("active");
        cursorDot.style.opacity = 0;
      }
    },
    true,
  );

  document.addEventListener(
    "mouseleave",
    (e) => {
      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains("hover-trigger")
      ) {
        cursorFollower.classList.remove("active");
        cursorDot.style.opacity = 1;
      }
    },
    true,
  );
}

function initThreeJS() {
  try {
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 64);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x999999,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(3, 0, -2);
    scene.add(mesh);
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x2d3748,
      transparent: true,
      opacity: 0.3,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);
    let mouseX = 0,
      mouseY = 0;
    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    });
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        mesh.rotation.y = self.progress * Math.PI * 4;
        mesh.rotation.x = self.progress * Math.PI * 2;
        mesh.position.y = -self.progress * 5;
        particlesMesh.rotation.y = self.progress * 0.5;
      },
    });
    function animate() {
      mesh.rotation.z += 0.001;
      particlesMesh.rotation.x += 0.0005;
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (err) {}
}

function initPinnedGalleryGSAP() {
  const cards = gsap.utils.toArray(".gallery-card");
  if (cards.length > 0 && window.innerWidth > 768) {
    gsap.fromTo(
      cards,
      {
        y: () => window.innerHeight,
        rotation: () => gsap.utils.random(-45, 45),
        scale: 0.5,
        opacity: 0,
      },
      {
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gallery-wrapper",
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=1500",
          invalidateOnRefresh: true,
        },
      },
    );
  }
}

function initStaticAnimations() {
  if (typeof SplitType !== "undefined") {
    const manifestoText = new SplitType(".reveal-text", { types: "chars" });
    gsap.fromTo(
      manifestoText.chars,
      { opacity: 0.2 },
      {
        opacity: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".manifesto",
          start: "top 80%",
          end: "bottom 60%",
          scrub: true,
        },
      },
    );
  }

  gsap.utils.toArray(".spotlight-card").forEach((card) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 80%" },
      },
    );
  });

  gsap.to(".parallax-img", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger: ".cinematic",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  document.querySelectorAll(".counter").forEach((counter) => {
    const target = parseFloat(counter.getAttribute("data-target"));
    ScrollTrigger.create({
      trigger: counter,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          innerHTML: target,
          duration: 2.5,
          ease: "power3.out",
          snap: { innerHTML: target % 1 === 0 ? 1 : 0.1 },
          onUpdate: function () {
            counter.innerHTML =
              Math.round(this.targets()[0].innerHTML * 10) / 10;
          },
        });
      },
    });
  });

  gsap.to(".marquee-content", {
    xPercent: -50,
    ease: "none",
    duration: 20,
    repeat: -1,
  });

  const accordions = document.querySelectorAll(".accordion-item");
  accordions.forEach((acc) => {
    acc.addEventListener("click", () => {
      const isOpen = acc.classList.contains("open");
      accordions.forEach((a) => a.classList.remove("open"));
      if (!isOpen) acc.classList.add("open");
      setTimeout(() => ScrollTrigger.refresh(), 400);
    });
  });
}

const fallbackAnimeData = [
  {
    title: "Jujutsu Kaisen",
    score: 8.7,
    status: "Airing",
    images: {
      jpg: {
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
      },
    },
  },
  {
    title: "Attack on Titan",
    score: 9.1,
    status: "Finished",
    images: {
      jpg: {
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
      },
    },
  },
  {
    title: "Fullmetal Alchemist",
    score: 9.1,
    status: "Finished",
    images: {
      jpg: {
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg",
      },
    },
  },
  {
    title: "Death Note",
    score: 8.6,
    status: "Finished",
    images: {
      jpg: {
        large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
      },
    },
  },
  {
    title: "Naruto Shippuden",
    score: 8.2,
    status: "Finished",
    images: {
      jpg: {
        large_image_url:
          "https://cdn.myanimelist.net/images/anime/15/79141l.jpg",
      },
    },
  },
];

async function loadData() {
  let apiData = [];
  try {
    const response = await fetch(
      "https://api.jikan.moe/v4/anime?q=action&order_by=score&sort=desc",
    );
    if (!response.ok) throw new Error("Rate Limit");
    const jsonResponse = await response.json();
    if (
      jsonResponse &&
      Array.isArray(jsonResponse.data) &&
      jsonResponse.data.length > 0
    ) {
      apiData = jsonResponse.data;
    } else {
      throw new Error("Invalid Payload");
    }
  } catch (error) {
    apiData = fallbackAnimeData;
  }
  populateBentoGrid(apiData.slice(0, 5));

  setTimeout(() => {
    initPinnedGalleryGSAP();
    ScrollTrigger.refresh();
  }, 300);
}

function populateBentoGrid(animeList) {
  const container = document.getElementById("bento-container");
  if (!container) return;
  const layoutClasses = [
    "large hover-trigger",
    "wide hover-trigger",
    "hover-trigger",
    "hover-trigger",
    "wide hover-trigger",
  ];
  const fallbackImg =
    "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=800&auto=format&fit=crop";

  animeList.forEach((anime, index) => {
    const card = document.createElement("div");
    card.className = `bento-card glass-neo ${layoutClasses[index] || "hover-trigger"}`;
    card.setAttribute("data-cursor", "VIEW");
    card.innerHTML = `
      <div class="bento-card-inner">
        <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" onerror="this.onerror=null; this.src='${fallbackImg}';">
      </div>
      <div class="bento-card-content glass-neo">
        <h3>${anime.title}</h3>
        <div class="tags">
          <span>SCORE: ${anime.score}</span><span>•</span><span>${anime.status}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
    const inner = card.querySelector(".bento-card-inner");
    card.addEventListener("mousemove", (e) => {
      if (window.innerWidth > 768) {
        const rect = card.getBoundingClientRect();
        const rotateX =
          ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY =
          ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;
        gsap.to(inner, { rotateX, rotateY, duration: 0.5, ease: "power2.out" });
      }
    });
    card.addEventListener("mouseleave", () => {
      if (window.innerWidth > 768) {
        gsap.to(inner, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initThreeJS();
  startPreloader();
  loadData();
});
