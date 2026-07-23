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
    <section className="relative w-full h-screen min-h-[800px] bg-bg-base overflow-hidden border-b border-accent-ink/20" ref={containerRef}>
      
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

      {/* Draggable Nodes */}
      <div className="drag-node absolute top-[40%] left-[20%] w-72 bg-white rounded-2xl shadow-md border border-accent-ink/30 p-6 cursor-grab active:cursor-grabbing z-10 hover:border-text-muted transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <h3 className="font-display font-bold text-lg text-text-primary">Core Architecture</h3>
        </div>
        <p className="font-body text-sm text-text-muted">
          Map out the fundamental relationships between entities before writing a single line of code.
        </p>
      </div>

      <div className="drag-node absolute top-[60%] left-[50%] w-64 bg-surface rounded-2xl shadow-md border border-accent-ink/30 p-6 cursor-grab active:cursor-grabbing z-10 hover:border-text-muted transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <h3 className="font-display font-bold text-lg text-text-primary">Auth Flow</h3>
        </div>
        <p className="font-body text-sm text-text-muted">
          Supabase OAuth integration and magic links.
        </p>
      </div>

      <div className="drag-node absolute top-[30%] left-[60%] w-80 bg-bg-warm rounded-2xl shadow-md border border-accent-ink/30 p-6 cursor-grab active:cursor-grabbing z-10 hover:border-text-muted transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <h3 className="font-display font-bold text-lg text-text-primary">Performance</h3>
        </div>
        <p className="font-body text-sm text-text-muted">
          Optimized React rendering with GSAP ticker sync. Ensures 60fps physics calculations even with hundreds of nodes.
        </p>
      </div>

    </section>
  );
};
