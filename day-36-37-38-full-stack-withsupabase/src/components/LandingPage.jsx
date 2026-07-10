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
  
  const titleRef = useRef();
  const subtextRef = useRef();
  const buttonsRef = useRef();
  const gridRef = useRef();
  const cursorRef = useRef();
  const spotlightRef = useRef();

  // Magnetic button state
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
    
    // Animate individual characters
    tl.fromTo('.char-element', 
      { y: 150, opacity: 0, rotateX: -90, scale: 0.5, filter: 'blur(20px)' }, 
      { y: 0, opacity: 1, rotateX: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.08, ease: "back.out(1.5)" }
    )
    .fromTo(subtextRef.current,
      { y: 50, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: "power3.out" },
      "-=0.8"
    )
    .fromTo(buttonsRef.current.children,
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(2)" },
      "-=0.6"
    )
    .fromTo(gridRef.current,
      { opacity: 0 },
      { opacity: 0.2, duration: 2, ease: "power2.inOut" },
      0
    );

    gsap.to(gridRef.current, {
      backgroundPosition: '100px 100px',
      duration: 10,
      repeat: -1,
      ease: "none"
    });
    
  }, { scope: containerRef });

  // Mouse Parallax & Custom Cursor
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    
    // Custom cursor & spotlight
    gsap.to(cursorRef.current, { x: clientX, y: clientY, duration: 0.1, ease: "power2.out" });
    gsap.to(spotlightRef.current, { x: clientX, y: clientY, duration: 0.6, ease: "power2.out" });

    // Parallax
    const xPos = (clientX / window.innerWidth - 0.5) * 2;
    const yPos = (clientY / window.innerHeight - 0.5) * 2;

    gsap.to(titleRef.current, { x: xPos * -40, y: yPos * -40, rotationY: xPos * 10, rotationX: -yPos * 10, duration: 1, ease: "power2.out" });
    gsap.to(subtextRef.current, { x: xPos * -20, y: yPos * -20, duration: 1, ease: "power2.out" });
    gsap.to(buttonsRef.current, { x: xPos * -10, y: yPos * -10, duration: 1, ease: "power2.out" });
    gsap.to(gridRef.current, { x: xPos * 30, y: yPos * 30, duration: 2, ease: "power2.out" });
  };

  // Magnetic button effect
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
      className="relative w-screen h-screen overflow-hidden bg-[#020202] text-white flex items-center justify-center perspective-[1200px] cursor-none"
    >
      {/* Custom Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      />

      {/* Spotlight */}
      <div 
        ref={spotlightRef}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full pointer-events-none z-0 blur-[100px] -translate-x-1/2 -translate-y-1/2"
      />

      {/* Film Grain Noise */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Background Grid */}
      <div 
        ref={gridRef}
        className="absolute inset-[-10%] z-0 w-[120%] h-[120%] opacity-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
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
          className="text-[6rem] md:text-[10rem] font-black tracking-tighter leading-none mb-6 drop-shadow-2xl flex perspective-[1000px]"
        >
          {"ZAFORGE".split('').map((char, i) => (
            <span key={i} className="char-element inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 opacity-0">{char}</span>
          ))}
        </h1>
        
        <p 
          ref={subtextRef}
          className="text-lg md:text-2xl text-gray-400 max-w-2xl font-light tracking-wide leading-relaxed mb-16 opacity-0"
        >
          Master your time. Shape your structure. The spatial operating system built for boundless creativity.
        </p>
        
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-6 pointer-events-auto">
          <div 
            ref={btn1Ref}
            onMouseMove={(e) => handleMagneticMove(e, btn1Ref)}
            onMouseLeave={() => handleMagneticLeave(btn1Ref)}
            className="p-4 -m-4 cursor-none"
          >
            <button 
              onClick={() => setRoute('app')}
              className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-110 duration-300"
            >
              Create New Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
          
          <div
            ref={btn2Ref}
            onMouseMove={(e) => handleMagneticMove(e, btn2Ref)}
            onMouseLeave={() => handleMagneticLeave(btn2Ref)}
            className="p-4 -m-4 cursor-none"
          >
            <button 
              onClick={handleInstallClick}
              className="group flex items-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all hover:scale-110 duration-300 backdrop-blur-sm"
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
