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
  
  // Parallax refs
  const titleRef = useRef();
  const subtextRef = useRef();
  const buttonsRef = useRef();
  const gridRef = useRef();

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
    // Initial Entrance Animation
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0, scale: 0.9, filter: 'blur(20px)' }, 
      { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: "power4.out" }
    )
    .fromTo(subtextRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=1.0"
    )
    .fromTo(buttonsRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.6"
    )
    .fromTo(gridRef.current,
      { opacity: 0 },
      { opacity: 0.15, duration: 2, ease: "power2.inOut" },
      0
    );

    // Continuous glowing grid animation
    gsap.to(gridRef.current, {
      backgroundPosition: '100px 100px',
      duration: 10,
      repeat: -1,
      ease: "none"
    });
    
  }, { scope: containerRef });

  // Mouse Parallax Effect
  const handleMouseMove = (e) => {
    if (!titleRef.current || !subtextRef.current || !buttonsRef.current || !gridRef.current) return;
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    const yPos = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    gsap.to(titleRef.current, { x: xPos * -30, y: yPos * -30, duration: 1, ease: "power2.out" });
    gsap.to(subtextRef.current, { x: xPos * -15, y: yPos * -15, duration: 1, ease: "power2.out" });
    gsap.to(buttonsRef.current, { x: xPos * -5, y: yPos * -5, duration: 1, ease: "power2.out" });
    gsap.to(gridRef.current, { x: xPos * 20, y: yPos * 20, duration: 2, ease: "power2.out" });
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen overflow-hidden bg-[#050505] text-white flex items-center justify-center perspective-[1000px]"
    >
      {/* Background Grid */}
      <div 
        ref={gridRef}
        className="absolute inset-[-10%] z-0 w-[120%] h-[120%] opacity-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
        }}
      ></div>

      {/* Floating Navbar */}
      <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase">Zaforge</span>
        </div>
        <div>
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-6 pointer-events-none">
        
        <h1 
          ref={titleRef}
          className="text-[6rem] md:text-[10rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-6 drop-shadow-2xl opacity-0"
        >
          ZAFORGE
        </h1>
        
        <p 
          ref={subtextRef}
          className="text-lg md:text-2xl text-gray-400 max-w-2xl font-light tracking-wide leading-relaxed mb-16 opacity-0"
        >
          Master your time. Shape your structure. The spatial operating system built for boundless creativity.
        </p>
        
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-6 pointer-events-auto">
          <button 
            onClick={() => setRoute('app')}
            className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            Create New Project
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
          
          <button 
            onClick={handleInstallClick}
            className="group flex items-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all hover:scale-105"
          >
            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
            Get the Software
          </button>
        </div>
      </div>
      
    </div>
  );
};
