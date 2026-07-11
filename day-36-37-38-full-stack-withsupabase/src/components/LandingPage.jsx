import React, { useRef, useEffect, useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LandingNavbar } from './LandingNavbar';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage = () => {
  const setRoute = usePlannerStore(state => state.setRoute);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const containerRef = useRef();
  
  // Hero Refs
  const titleRef = useRef();
  const blurCircleRef = useRef();
  const horizonRef = useRef();
  const lineRef = useRef();
  const uiElementsRef = useRef();
  const buttonsContainerRef = useRef();
  const navbarRef = useRef();

  // Scroll Section Refs
  const introRef = useRef();
  const bentoRefs = useRef([]);
  const roadmapRefs = useRef([]);
  const footerRef = useRef();

  const handleDownload = () => {
    // Placeholder for PWA install event
    console.log('Download initiated');
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ---------------------------------
      // HERO ENTRANCE TIMELINE
      // ---------------------------------
      const tl = gsap.timeline();

      tl.fromTo(titleRef.current, 
        { scale: 1.1, opacity: 0, filter: 'blur(10px)' }, 
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 2, ease: "power4.out" }
      )
      .fromTo(blurCircleRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 3, ease: "power2.out" },
        "-=1.5"
      )
      .fromTo(horizonRef.current,
        { y: '100%' },
        { y: '0%', duration: 2, ease: "power4.out" },
        "-=1.5"
      )
      .fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: 'center', duration: 1.5, ease: "expo.inOut" },
        "-=1"
      )
      .fromTo(uiElementsRef.current.children,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power2.out" },
        "-=1"
      )
      .fromTo(buttonsContainerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.8"
      )
      .fromTo(navbarRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
        "-=1"
      );

      // ---------------------------------
      // SCROLL REVEALS
      // ---------------------------------
      // Section 1: Intro Text
      gsap.fromTo(introRef.current, 
        { y: 50, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 1.5, ease: "power3.out",
          scrollTrigger: {
            trigger: introRef.current,
            scroller: containerRef.current,
            start: "top 80%"
          }
        }
      );

      // Section 2: Bento Cards (Staggered)
      gsap.fromTo(bentoRefs.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: {
            trigger: bentoRefs.current[0],
            scroller: containerRef.current,
            start: "top 85%"
          }
        }
      );

      // Section 3: Roadmap Items (Staggered)
      gsap.fromTo(roadmapRefs.current,
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out",
          scrollTrigger: {
            trigger: roadmapRefs.current[0],
            scroller: containerRef.current,
            start: "top 85%"
          }
        }
      );

      // Section 4: Footer
      gsap.fromTo(footerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            scroller: containerRef.current,
            start: "top 95%"
          }
        }
      );

      // ---------------------------------
      // PARALLAX PHYSICS (quickTo)
      // ---------------------------------
      const titleXTo = gsap.quickTo(titleRef.current, "x", { duration: 1, ease: "power3" });
      const titleYTo = gsap.quickTo(titleRef.current, "y", { duration: 1, ease: "power3" });
      
      const blurXTo = gsap.quickTo(blurCircleRef.current, "x", { duration: 1.5, ease: "power2" });
      const blurYTo = gsap.quickTo(blurCircleRef.current, "y", { duration: 1.5, ease: "power2" });

      const horizonXTo = gsap.quickTo(horizonRef.current, "x", { duration: 1.2, ease: "power2" });
      const horizonYTo = gsap.quickTo(horizonRef.current, "y", { duration: 1.2, ease: "power2" });

      const handleMouseMove = (e) => {
        // Normalize mouse coordinates from -1 to 1
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;

        titleXTo(x * -20); 
        titleYTo(y * -10);
        blurXTo(x * -40);
        blurYTo(y * -20);
        horizonXTo(x * 20); 
        horizonYTo(y * 10);
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };

    }, containerRef); // Scope to containerRef

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-screen bg-[#050505] overflow-x-hidden overflow-y-auto text-white selection:bg-white/20 custom-scrollbar"
    >
      <div ref={navbarRef} className="fixed top-0 left-0 w-full z-50 pointer-events-auto">
        <LandingNavbar onLoginClick={() => setIsAuthModalOpen(true)} />
      </div>

      {/* =========================================
          HERO SECTION (100vh)
          ========================================= */}
      <div className="relative w-full h-screen shrink-0 overflow-hidden pointer-events-none">
        
        {/* LAYER 0: Background Noise & Ambient Mouse Glow */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.04] mix-blend-screen" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
        />

        {/* LAYER 10: Massive Text */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pb-[15vh] pointer-events-none">
          <h1 
            ref={titleRef}
            className="text-[16vw] font-bold uppercase tracking-tighter leading-none"
            style={{ 
              fontFamily: "'Syncopate', sans-serif",
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.9)',
              textShadow: '0 0 40px rgba(255,255,255,0.1)'
            }}
          >
            ZAFORGE
          </h1>
        </div>

        {/* LAYER 20: Glowing Aura (replaces the image) */}
        <div 
          ref={blurCircleRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full z-[15] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 40%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />

        {/* LAYER 30: The Foreground Horizon */}
        <div 
          ref={horizonRef}
          className="absolute bottom-0 w-[150vw] left-1/2 -translate-x-1/2 h-[30vh] bg-[#0A0A0C]/40 backdrop-blur-3xl z-30"
          style={{ 
            borderRadius: '50% 50% 0 0',
            boxShadow: 'inset 0 30px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05), 0 -20px 100px rgba(0,0,0,0.5)'
          }}
        />

        {/* LAYER 40: TECHNICAL MICRO-UI & BUTTONS */}
        <div className="absolute bottom-[30vh] w-full z-40">
          
          <div ref={lineRef} className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div ref={uiElementsRef} className="absolute bottom-0 w-full px-8 pb-4 flex items-end justify-between">
            <div 
              className="text-[10px] text-white/50 tracking-[0.3em] uppercase hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              SYS.STATE // ACTIVE
            </div>

            <div 
              className="absolute left-1/2 -translate-x-1/2 text-sm text-white/60 tracking-wider font-light mb-[-4px] text-center w-full md:w-auto"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              The infinite spatial canvas for boundless creativity.
            </div>

            <div 
              className="text-[10px] text-white/50 tracking-[0.3em] uppercase text-right hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              COORD // 0,0,0
            </div>
          </div>
        </div>

        {/* CTA Buttons placed independently to rest ON the horizon */}
        <div 
          ref={buttonsContainerRef}
          className="absolute top-[75%] md:top-[78%] w-full flex flex-col justify-center items-center gap-6 z-40 pointer-events-auto px-4"
        >
          <button 
            onClick={() => setRoute('app')}
            className="group relative px-10 py-4 bg-white text-black rounded-full hover:scale-105 transition-all duration-500 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-3 text-sm tracking-widest font-bold uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Initiate Workspace
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
          
          <button 
            onClick={handleDownload}
            className="group relative text-white/50 hover:text-white transition-colors duration-300 text-xs tracking-[0.2em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Download Zaforge
            <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-white/20 group-hover:bg-white transition-colors duration-300" />
          </button>
        </div>
      </div>


      {/* =========================================
          SECTION 1: THE CASUAL INTRO
          ========================================= */}
      <div className="relative w-full py-40 px-8 md:px-24 flex justify-start z-10 bg-[#050505]">
        <div 
          ref={introRef}
          className="max-w-5xl text-left text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tighter text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="text-white/30 block mb-6 font-mono text-sm tracking-widest uppercase">The Manifesto</span>
          Folders are dead. <br className="hidden md:block"/>
          Your brain doesn't work in straight lines. <br className="hidden md:block"/>
          <span className="text-white/50">We built a limitless spatial canvas for your chaotic, brilliant mind.</span>
        </div>
      </div>


      {/* =========================================
          SECTION 2: THE TUTORIAL BENTO GRID
          ========================================= */}
      <div className="relative w-full py-24 px-6 z-10 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-sm text-[#F97316] tracking-[0.3em] uppercase mb-12 text-center"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            HOW IT WORKS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Card 1 */}
            <div 
              ref={el => bentoRefs.current[0] = el}
              className="group bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors duration-500 flex flex-col"
            >
              <div className="w-full h-48 rounded-2xl mb-8 overflow-hidden relative flex items-center justify-center bg-black/50">
                {/* CSS Infinite Grid */}
                <div 
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    transform: 'perspective(500px) rotateX(60deg) scale(2)',
                    transformOrigin: 'top'
                  }}
                />
              </div>
              <h3 className="text-2xl text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Infinite Space</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Break free from structured documents. Zoom out to see the big picture, or zoom in to focus on micro-details.</p>
            </div>

            {/* Card 2 */}
            <div 
              ref={el => bentoRefs.current[1] = el}
              className="group bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors duration-500 flex flex-col"
            >
              <div className="w-full h-48 rounded-2xl mb-8 overflow-hidden relative flex items-center justify-center bg-black/50">
                {/* CSS Geometry */}
                <div className="w-20 h-20 border border-white/20 rounded-full absolute -translate-x-4 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-out" />
                <div className="w-20 h-20 border border-white/40 rounded-lg absolute translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-out backdrop-blur-sm" />
              </div>
              <h3 className="text-2xl text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Smart Geometry</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Rich polymorphic nodes hold text, images, code, and iframes seamlessly in a single unified view.</p>
            </div>

            {/* Card 3 */}
            <div 
              ref={el => bentoRefs.current[2] = el}
              className="group bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors duration-500 flex flex-col"
            >
              <div className="w-full h-48 rounded-2xl mb-8 overflow-hidden relative flex items-center justify-center bg-black/50">
                {/* SVG Neural Wire */}
                <svg className="w-full h-full opacity-30 group-hover:opacity-70 transition-opacity duration-700" viewBox="0 0 200 100" fill="none" stroke="white" strokeWidth="0.5">
                  <path d="M 20,50 C 60,10 140,90 180,50" className="group-hover:stroke-[#F97316] transition-colors duration-700" strokeDasharray="4 4" />
                  <circle cx="20" cy="50" r="3" fill="white" />
                  <circle cx="180" cy="50" r="3" fill="white" />
                </svg>
              </div>
              <h3 className="text-2xl text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Neural Linking</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Draw complex relationships between disparate ideas using our bezier-curve neural wire system.</p>
            </div>

          </div>
        </div>
      </div>


      {/* =========================================
          SECTION 3: THE FUTURE ROADMAP
          ========================================= */}
      <div className="relative w-full py-32 px-6 md:px-24 z-10 bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          
          <h2 className="text-xs text-white/30 tracking-[0.3em] uppercase mb-16 border-b border-white/10 pb-4">
            System Schematic // Roadmap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-6 left-10 right-10 h-[1px] bg-white/10 z-0" />
            
            {/* Item 1 */}
            <div ref={el => roadmapRefs.current[0] = el} className="relative z-10 group">
              <div className="w-12 h-12 rounded-full border border-[#F97316]/30 bg-[#050505] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                <div className="w-2 h-2 rounded-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
              </div>
              <div className="text-[10px] text-[#F97316] tracking-widest mb-4 font-bold uppercase">Phase 1 / Active</div>
              <div className="text-lg text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cloud Sync & Auth</div>
              <div className="text-xs text-white/40 leading-relaxed border-l border-white/10 pl-4">Sync your spatial workspaces across all your devices securely in the cloud via Supabase.</div>
            </div>

            {/* Item 2 */}
            <div ref={el => roadmapRefs.current[1] = el} className="relative z-10 group opacity-50 hover:opacity-100 transition-opacity duration-500">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-[#050505] flex items-center justify-center mb-6 group-hover:border-white/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
              </div>
              <div className="text-[10px] text-white/40 tracking-widest mb-4 uppercase">Phase 2 / Queued</div>
              <div className="text-lg text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Local AI Bridge</div>
              <div className="text-xs text-white/40 leading-relaxed border-l border-white/10 pl-4">Deploy local LLMs that can traverse and organize your canvas nodes autonomously via Web Workers.</div>
            </div>

            {/* Item 3 */}
            <div ref={el => roadmapRefs.current[2] = el} className="relative z-10 group opacity-30 hover:opacity-100 transition-opacity duration-500">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-[#050505] flex items-center justify-center mb-6 group-hover:border-white/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
              </div>
              <div className="text-[10px] text-white/40 tracking-widest mb-4 uppercase">Phase 3 / Queued</div>
              <div className="text-lg text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Multiplayer Canvas</div>
              <div className="text-xs text-white/40 leading-relaxed border-l border-white/10 pl-4">Collaborate spatially with your entire team via WebRTC peer-to-peer real-time syncing.</div>
            </div>

          </div>
        </div>
      </div>


      {/* =========================================
          SECTION 4: THE TECHNICAL FOOTER
          ========================================= */}
      <footer 
        ref={footerRef}
        className="relative w-full border-t border-white/10 py-20 px-8 flex flex-col md:flex-row justify-between items-end gap-6 z-10 bg-[#050505] overflow-hidden"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {/* Massive Background Text */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-white/[0.02] uppercase tracking-tighter leading-none pointer-events-none whitespace-nowrap" style={{ fontFamily: "'Syncopate', sans-serif" }}>
          ZAFORGE
        </div>

        <div className="text-[10px] text-white/30 tracking-widest uppercase relative z-10">
          ZAFORGE // SYSTEM V1.0 <br/>
          <span className="text-white/20 mt-2 block">&copy; {new Date().getFullYear()} ALL RIGHTS RESERVED.</span>
        </div>
        
        <div className="flex items-center gap-8 text-[10px] text-white/30 tracking-widest uppercase relative z-10">
          <a href="#" className="hover:text-white transition-colors">Twitter // X</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <span className="text-white/50 bg-white/5 px-4 py-2 rounded-full">Built for builders.</span>
        </div>
      </footer>

      
      {/* =========================================
          AUTH MODAL
          ========================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: "'Syncopate', sans-serif" }}>
              ACCESS ZAFORGE
            </h2>
            <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Sign in to synchronize your spatial canvases.
            </p>

            <div className="flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="developer@zaforge.com" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-colors font-mono text-sm w-full"
              />
              
              <button className="w-full bg-[#F97316] text-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform mt-2">
                Sign In with Email
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="font-mono text-xs text-gray-500">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
