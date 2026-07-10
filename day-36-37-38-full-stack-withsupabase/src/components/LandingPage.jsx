import React, { useEffect, useState, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Hexagon, Download, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export const LandingPage = () => {
  const setRoute = usePlannerStore(state => state.setRoute);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const containerRef = useRef();
  const preloaderRef = useRef();
  
  const titleRef = useRef();
  const subtextRef = useRef();
  const buttonsRef = useRef();
  const gridRef = useRef();
  const spotlightRef = useRef();
  const spotlight2Ref = useRef();
  const kineticRef = useRef();

  const btn1Ref = useRef();
  const btn2Ref = useRef();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("App is already installed or your browser doesn't support PWA installation right now.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // 1. Preloader text reveal
    tl.fromTo('.preloader-char', 
      { y: '100%' }, 
      { y: '0%', duration: 1.2, stagger: 0.05, ease: "power4.out" }
    )
    // 2. Preloader pause
    .to({}, { duration: 0.5 })
    // 3. Preloader slide up & off screen
    .to(preloaderRef.current,
      { y: '-100%', duration: 1.2, ease: "expo.inOut" }
    )
    // 4. Main Title advanced reveal (starts slightly before preloader finishes)
    .fromTo('.main-char', 
      { y: 150, opacity: 0, rotateX: -90, scale: 0.5, filter: 'blur(20px)' }, 
      { y: 0, opacity: 1, rotateX: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.04, ease: "back.out(1.2)" },
      "-=0.6"
    )
    // 5. Subtext reveal
    .fromTo(subtextRef.current,
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: "power3.out" },
      "-=0.8"
    )
    // 6. Buttons pop in
    .fromTo(buttonsRef.current.children,
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "back.out(2)" },
      "-=0.6"
    )
    // 7. Grid fade in
    .fromTo(gridRef.current,
      { opacity: 0 },
      { opacity: 0.5, duration: 2, ease: "power2.inOut" },
      "-=1.5"
    );

    // Continuous grid drift
    gsap.to(gridRef.current, {
      backgroundPosition: '100px 100px',
      duration: 15,
      repeat: -1,
      ease: "none"
    });

    // Kinetic Background Text scrolling
    gsap.to(kineticRef.current, {
      x: '-50%',
      duration: 20,
      repeat: -1,
      ease: "none"
    });

    // Liquid spotlight 2 movement
    gsap.to(spotlight2Ref.current, {
      x: '50vw',
      y: '20vh',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
  }, { scope: containerRef });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    
    // Spotlight
    gsap.to(spotlightRef.current, { x: clientX, y: clientY, duration: 0.8, ease: "power2.out" });

    // Subtle 2D Parallax
    const xPos = (clientX / window.innerWidth - 0.5) * 2;
    const yPos = (clientY / window.innerHeight - 0.5) * 2;

    gsap.to(titleRef.current, { x: xPos * -25, y: yPos * -25, rotationY: xPos * 5, rotationX: -yPos * 5, duration: 1.5, ease: "power2.out" });
    gsap.to(subtextRef.current, { x: xPos * -15, y: yPos * -15, duration: 1.5, ease: "power2.out" });
    gsap.to(buttonsRef.current, { x: xPos * -8, y: yPos * -8, duration: 1.5, ease: "power2.out" });
    gsap.to(gridRef.current, { x: xPos * 20, y: yPos * 20, duration: 2.5, ease: "power2.out" });
  };

  const handleMagneticMove = (e, ref) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: "power2.out" });
  };

  const handleMagneticLeave = (ref) => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen overflow-hidden bg-[#FAFAFA] text-[#050505] flex items-center justify-center perspective-[1200px] font-sans"
    >
      {/* 1. PRELOADER OVERLAY */}
      <div 
        ref={preloaderRef}
        className="fixed inset-0 z-[200] bg-[#050505] text-[#FAFAFA] flex items-center justify-center pointer-events-none"
      >
        <div className="overflow-hidden">
          <h2 className="text-4xl md:text-6xl font-black tracking-widest flex overflow-hidden">
            {"ZAFORGE".split('').map((char, i) => (
              <span key={i} className="preloader-char inline-block translate-y-[100%]">{char}</span>
            ))}
          </h2>
        </div>
      </div>

      {/* 2. SPOTLIGHTS & KINETIC BACKGROUND */}
      <div 
        ref={spotlightRef}
        className="fixed top-0 left-0 w-[800px] h-[800px] bg-black/[0.03] rounded-full pointer-events-none z-0 blur-[80px] -translate-x-1/2 -translate-y-1/2"
      />
      <div 
        ref={spotlight2Ref}
        className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gray-400/[0.1] rounded-full pointer-events-none z-0 blur-[100px]"
      />

      <div 
        ref={kineticRef}
        className="absolute top-[20%] left-0 whitespace-nowrap text-[20rem] font-black pointer-events-none z-0 opacity-[0.03] select-none flex gap-8"
        style={{ WebkitTextStroke: '2px black', color: 'transparent' }}
      >
        <span>ZAFORGE ZAFORGE ZAFORGE ZAFORGE ZAFORGE</span>
      </div>

      {/* Film Grain Noise (darker for white bg) */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Background Grid (dark lines) */}
      <div 
        ref={gridRef}
        className="absolute inset-[-10%] z-0 w-[120%] h-[120%] opacity-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
        }}
      ></div>

      {/* 3. NAVIGATION */}
      <nav className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl bg-white/40 backdrop-blur-xl border border-black/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase text-black">Zaforge</span>
        </div>
        <div>
          <button className="text-sm font-bold text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-black/5">
            Login
          </button>
        </div>
      </nav>

      {/* 4. MAIN HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-6 pointer-events-none mt-12">
        <h1 
          ref={titleRef}
          className="text-[6rem] md:text-[11rem] font-black tracking-tighter leading-none mb-6 flex perspective-[1000px] text-black"
        >
          {"ZAFORGE".split('').map((char, i) => (
            <span 
              key={i} 
              className="main-char inline-block opacity-0 transition-transform duration-300 hover:scale-125 hover:-translate-y-4 hover:text-gray-500 hover:rotate-[10deg] cursor-crosshair"
            >
              {char}
            </span>
          ))}
        </h1>
        
        <p 
          ref={subtextRef}
          className="text-xl md:text-2xl text-gray-600 max-w-2xl font-medium tracking-wide leading-relaxed mb-16 opacity-0"
        >
          Master your time. Shape your structure. The spatial operating system built for boundless creativity.
        </p>
        
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-8 pointer-events-auto">
          <div 
            ref={btn1Ref}
            onMouseMove={(e) => handleMagneticMove(e, btn1Ref)}
            onMouseLeave={() => handleMagneticLeave(btn1Ref)}
            className="p-6 -m-6 cursor-pointer"
          >
            <button 
              onClick={() => setRoute('app')}
              className="group flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 duration-300"
            >
              Create New Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
          
          <div
            ref={btn2Ref}
            onMouseMove={(e) => handleMagneticMove(e, btn2Ref)}
            onMouseLeave={() => handleMagneticLeave(btn2Ref)}
            className="p-6 -m-6 cursor-pointer"
          >
            <button 
              onClick={handleInstallClick}
              className="group flex items-center gap-3 px-10 py-5 bg-transparent border-2 border-black/10 text-black rounded-full font-bold text-lg hover:bg-black/5 hover:border-black/30 transition-all hover:scale-105 duration-300"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
              Get the Software
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};
