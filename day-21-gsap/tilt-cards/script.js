window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ duration: 1.5, smooth: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const cursorNode = document.querySelector(".cursor-node");
  if (cursorNode) {
    const xTo = gsap.quickTo(cursorNode, "left", {
      duration: 0.2,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursorNode, "top", {
      duration: 0.2,
      ease: "power3.out",
    });

    window.addEventListener("mousemove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    document.querySelectorAll(".monolith-box, .portal-close").forEach((el) => {
      el.addEventListener("mouseenter", () =>
        cursorNode.classList.add("active"),
      );
      el.addEventListener("mouseleave", () =>
        cursorNode.classList.remove("active"),
      );
    });
  }

  const canvas = document.getElementById("canvas-pneuma");
  let pneumaMesh, posAttr, originalPositions;
  const webglState = { excitation: 0.08 };

  if (canvas && typeof THREE !== "undefined") {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const baseGeometry = new THREE.IcosahedronGeometry(6.5, 45);
    posAttr = baseGeometry.attributes.position;
    originalPositions = new Float32Array(posAttr.array);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x111113,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.6,
      thickness: 2.5,
      ior: 1.4,
    });

    pneumaMesh = new THREE.Mesh(baseGeometry, material);
    scene.add(pneumaMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointCyan = new THREE.PointLight(0xdfc39a, 4.0, 50);
    scene.add(pointCyan);
    const pointGold = new THREE.PointLight(0x8c8c88, 5.0, 50);
    scene.add(pointGold);

    let mX = 0,
      mY = 0;
    window.addEventListener("mousemove", (e) => {
      mX = e.clientX / window.innerWidth - 0.5;
      mY = e.clientY / window.innerHeight - 0.5;
    });

    let lastScrollTop = 0;
    lenis.on("scroll", (e) => {
      const delta = Math.abs(e.velocity || e.scroll - lastScrollTop);
      lastScrollTop = e.scroll;

      const clampedSpike = gsap.utils.clamp(0.08, 3.5, delta * 0.08);
      gsap.killTweensOf(webglState);
      webglState.excitation = clampedSpike;

      gsap.to(webglState, {
        excitation: 0.08,
        duration: 1.8,
        ease: "power2.out",
      });
    });

    const clock = new THREE.Clock();

    const renderPneuma = () => {
      const t = clock.getElapsedTime() * 0.4;
      const ex = webglState.excitation;

      pneumaMesh.rotation.x = gsap.utils.interpolate(
        pneumaMesh.rotation.x,
        mY * 0.8 + t * 0.1,
        0.04,
      );
      pneumaMesh.rotation.y = gsap.utils.interpolate(
        pneumaMesh.rotation.y,
        mX * 0.8 + t * 0.15,
        0.04,
      );

      pointCyan.position.set(
        Math.cos(t * 1.2) * 15,
        Math.sin(t * 1.2) * 15,
        Math.sin(t * 0.8) * 10,
      );
      pointGold.position.set(
        Math.sin(t * 1.5) * -15,
        Math.cos(t * 1.5) * -15,
        Math.cos(t * 0.9) * 10,
      );

      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 3) {
        const ox = originalPositions[i],
          oy = originalPositions[i + 1],
          oz = originalPositions[i + 2];
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const w1 = Math.sin(ox * 0.4 + t * 2.5);
        const w2 = Math.cos(oy * 0.4 + t * 2.5);
        const w3 = Math.sin(oz * 0.4 + t * 2.5);
        const d = (w1 + w2 + w3) * ex;
        const f = (len + d) / len;
        arr[i] = ox * f;
        arr[i + 1] = oy * f;
        arr[i + 2] = oz * f;
      }
      posAttr.needsUpdate = true;
      baseGeometry.computeVertexNormals();

      renderer.render(scene, camera);
      requestAnimationFrame(renderPneuma);
    };
    renderPneuma();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  const cylStage = document.getElementById("stage-cylinder");
  const carousel = document.getElementById("spin-continuum");

  if (cylStage && carousel) {
    gsap.to(carousel, {
      rotateY: -360,
      ease: "none",
      scrollTrigger: {
        trigger: cylStage,
        start: "center center",
        end: "+=250%",
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      },
    });
  }

  const pBg = document.querySelector("#p-bg img");
  const pFg = document.querySelector("#p-fg");
  if (pBg && pFg) {
    gsap.to(pBg, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".parallax-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap -
      to(pFg, {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
  }

  gsap.utils.toArray(".anthology-row").forEach((row) => {
    const line = row.querySelector(".story-line");
    const prose = row.querySelector(".story-prose");

    gsap.fromTo(
      [line, prose],
      { opacity: 0, y: 50, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.4,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  const portal = document.getElementById("portal-view");
  const pId = document.getElementById("p-id");
  const pTitle = document.getElementById("p-title");
  const pProse = document.getElementById("p-prose");
  const pImg = document.getElementById("p-img");

  const portalAssets = [
    {
      id: "// 01.LITHIC",
      title: "THE WEIGHT",
      prose:
        "Raw basaltic geometry anchoring the user's perception against the weightless vertigo of the digital infinite.",
      img: "https://i.pinimg.com/736x/69/7f/73/697f737f5bd3394fd6c8734199c4b586.jpg",
    },
    {
      id: "// 02.SOMATIC",
      title: "THE TENDERNESS",
      prose:
        "Chiaroscuro marble flesh captured in the quiet shadow of a museum continuum. An organic monument.",
      img: "https://i.pinimg.com/1200x/31/a8/75/31a8757372412d7000f6eef7eb852445.jpg",
    },
    {
      id: "// 03.VESTIGE",
      title: "THE MEMORY",
      prose:
        "Monolithic poured concrete sliced by a single diagonal blade of morning sunlight. Architecture stripped of occupancy.",
      img: "https://i.pinimg.com/736x/96/ae/46/96ae469da36107c1ff71dc8b0df7ca76.jpg",
    },
    {
      id: "// 04.RADIOGRAPH",
      title: "THE SPIRIT",
      prose:
        "High-voltage solarized botanical radiograph. Matter vibrating at a frequency so extreme it escapes physical containment.",
      img: "https://i.pinimg.com/736x/d4/dc/ce/d4dcce3ff5b7a7489284e7fa006d2dc3.jpg",
    },
  ];

  document.querySelectorAll(".monolith-box").forEach((box, idx) => {
    box.addEventListener("click", () => {
      lenis.stop();
      const data = portalAssets[idx];

      pId.innerText = data.id;
      pTitle.innerText = data.title;
      pProse.innerText = data.prose;
      pImg.src = data.img;

      portal.style.display = "block";
      gsap.fromTo(
        portal,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "expo.inOut" },
      );
      gsap.fromTo(
        ".portal-layout",
        { scale: 0.96, y: 30 },
        { scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 },
      );
    });
  });

  document.querySelector(".portal-close").addEventListener("click", () => {
    gsap.to(portal, {
      opacity: 0,
      duration: 0.5,
      ease: "expo.out",
      onComplete: () => {
        portal.style.display = "none";
        lenis.start();
      },
    });
  });
});
