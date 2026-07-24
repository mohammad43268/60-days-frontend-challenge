import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export const DragDemoSection = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Check if user prefers reduced motion. If so, disable drag.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Only initialize draggable on desktop/large screens to avoid breaking mobile scrolling
    const isDesktop = window.innerWidth > 768;

    if (!prefersReducedMotion && isDesktop) {
      Draggable.create('.drag-node', {
        type: 'x,y',
        bounds: containerRef.current,
        inertia: true, // Requires InertiaPlugin
        edgeResistance: 0.65,
        onDragStart: function() {
          gsap.to(this.target, { 
            scale: 1.05, 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            duration: 0.2 
          });
          // Bring to front
          gsap.set(this.target, { zIndex: 50 });
        },
        onDragEnd: function() {
          gsap.to(this.target, { 
            scale: 1, 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            duration: 0.4,
            ease: 'back.out(1.5)'
          });
          gsap.set(this.target, { zIndex: 10 });
        }
      });
    }

    // Scroll reveal
    gsap.from('.drag-reveal', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

  }, { scope: containerRef });

  return (
    <section className="parallax-section relative z-20 w-full h-screen min-h-[800px] bg-bg-base overflow-hidden -mt-16 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t border-accent-ink/20" ref={containerRef}>
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'radial-gradient(var(--accent-ink) 1px, transparent 1px)', 
        backgroundSize: '40px 40px',
        opacity: 0.3 
      }}></div>

      <div className="relative z-0 pt-32 px-8 text-center pointer-events-none">
        <h2 className="drag-reveal font-display font-bold text-4xl md:text-5xl text-text-primary uppercase tracking-tight mb-4">
          Spatial Freedom
        </h2>
        <p className="drag-reveal font-body text-text-muted max-w-xl mx-auto">
          Break free from linear documents. Grab, throw, and position nodes anywhere on the infinite canvas. (Try dragging them).
        </p>
      </div>

      <div className="relative w-full h-[600px] md:h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="relative w-[1000px] md:w-full h-full">
      {/* Draggable Nodes */}
      <div className="drag-node absolute top-[35%] left-[15%] w-72 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-accent-ink/20 p-6 cursor-grab active:cursor-grabbing z-10 hover:border-text-muted transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <h3 className="font-display font-bold text-lg text-text-primary">Core Architecture</h3>
        </div>
        <p className="font-body text-sm text-text-muted leading-relaxed">
          Map out the fundamental relationships between entities before writing a single line of code.
        </p>
      </div>

      <div className="drag-node absolute top-[65%] left-[25%] w-64 bg-surface/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-accent-ink/20 p-6 cursor-grab active:cursor-grabbing z-10 hover:border-text-muted transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <h3 className="font-display font-bold text-lg text-text-primary">Auth Flow</h3>
        </div>
        <p className="font-body text-sm text-text-muted leading-relaxed">
          Supabase OAuth integration and magic links built right in.
        </p>
      </div>

      <div className="drag-node absolute top-[20%] left-[45%] w-96 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-accent-ink/20 p-2 cursor-grab active:cursor-grabbing z-20 hover:border-text-muted transition-colors duration-300">
        <img 
          src="/projectimg.png" 
          alt="Creative Vision" 
          className="w-full h-40 object-cover rounded-xl pointer-events-none"
        />
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <h3 className="font-display font-bold text-lg text-text-primary">Creative Vision</h3>
          </div>
          <p className="font-body text-sm text-text-muted leading-relaxed">
            Attach inspiration boards, mood rings, and reference material directly to your engineering nodes.
          </p>
        </div>
      </div>

      <div className="drag-node absolute top-[60%] left-[65%] w-72 bg-bg-warm rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-accent-ink/20 p-6 cursor-grab active:cursor-grabbing z-10 hover:border-text-muted transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <h3 className="font-display font-bold text-lg text-text-primary">Performance</h3>
        </div>
        <p className="font-body text-sm text-text-muted leading-relaxed">
          Optimized React rendering with GSAP ticker sync. Ensures 60fps physics calculations.
        </p>
      </div>

      <div className="drag-node absolute top-[25%] left-[80%] w-56 h-72 bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-accent-ink/20 p-2 flex flex-col cursor-grab active:cursor-grabbing z-20 hover:border-text-muted transition-colors duration-300">
        <img 
          src="/projectimg1.png" 
          alt="Data Structures" 
          className="w-full flex-grow object-cover rounded-xl pointer-events-none mb-3"
        />
        <div className="px-2 pb-2">
          <h3 className="font-display font-bold text-md text-text-primary leading-tight mb-1">Docs</h3>
          <p className="font-body text-xs text-text-muted">Interactive project documentation.</p>
        </div>
      </div>

      <div className="drag-node absolute top-[75%] left-[45%] w-48 bg-[#161618] text-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-white/10 p-5 cursor-grab active:cursor-grabbing z-30 hover:border-white/30 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-md tracking-wide">COMPONENTS</h3>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-white/10 rounded-full"></div>
          <div className="h-2 w-3/4 bg-white/10 rounded-full"></div>
          <div className="h-2 w-5/6 bg-white/10 rounded-full">
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};
