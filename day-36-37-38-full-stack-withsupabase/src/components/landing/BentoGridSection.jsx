import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export const BentoGridSection = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    // 1. Scroll Reveal for Grid Tiles (using standard iteration instead of batch to play nice with useGSAP context)
    const tiles = gsap.utils.toArray('.bento-tile');
    
    tiles.forEach((tile, index) => {
      gsap.fromTo(tile,
        { opacity: 0, scale: 0.9, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: tile,
            start: 'top 85%',
          }
        }
      );
    });

    // 2. Motion Path Animation for decorative element in tile 3
    const path = "#motion-path";
    gsap.to(".motion-dot", {
      motionPath: {
        path: path,
        align: path,
        alignOrigin: [0.5, 0.5],
        autoRotate: true
      },
      duration: 10,
      repeat: -1,
      ease: "linear"
    });

  }, { scope: containerRef });

  return (
    <section className="parallax-section relative z-40 w-full min-h-screen bg-bg-base py-32 px-4 sm:px-6 lg:px-8 -mt-16 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t border-accent-ink/20" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-text-primary uppercase tracking-tight mb-4">
            Everything connects.
          </h2>
          <p className="font-body text-text-muted max-w-2xl">
            A tool that molds to your cognitive flow, not the other way around.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-6 auto-rows-[250px]">
          
          {/* Tile 1: Large Span */}
          <div className="bento-tile md:col-span-2 md:row-span-2 rounded-3xl bg-surface border border-accent-ink/30 p-8 flex flex-col justify-between opacity-0">
            <div>
              <h3 className="font-display font-bold text-2xl text-text-primary mb-2">Realtime Collaboration</h3>
              <p className="font-body text-text-muted">Work alongside your team simultaneously without conflict overhead.</p>
            </div>
            <div className="w-full h-32 bg-white/50 rounded-2xl flex items-center justify-center border border-white/20 mt-8">
              {/* Fake UI */}
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-surface"></div>
                <div className="w-10 h-10 rounded-full bg-red-300 border-2 border-surface"></div>
                <div className="w-10 h-10 rounded-full bg-green-300 border-2 border-surface"></div>
              </div>
            </div>
          </div>

          {/* Tile 2: Small Square */}
          <div className="bento-tile md:col-span-1 md:row-span-1 rounded-3xl bg-bg-warm border border-accent-ink/30 p-8 flex flex-col justify-between opacity-0">
            <div>
              <h3 className="font-display font-bold text-xl text-text-primary mb-2">60 FPS</h3>
              <p className="font-body text-text-muted text-sm">Hardware-accelerated performance.</p>
            </div>
          </div>

          {/* Tile 3: Medium Span with Motion Path */}
          <div className="bento-tile md:col-span-1 md:row-span-2 rounded-3xl bg-text-primary border border-text-primary p-8 flex flex-col justify-between opacity-0 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-display font-bold text-2xl text-bg-base mb-2">Infinite Workflow</h3>
              <p className="font-body text-bg-warm opacity-80 text-sm">No boundaries. Just scale.</p>
            </div>
            
            {/* Motion Path Graphic */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-30">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <path id="motion-path" d="M 10 50 Q 50 10 90 50 T 170 50" fill="none" stroke="var(--bg-warm)" strokeWidth="1" strokeDasharray="4 4" />
                {/* The Dot that animates along the path */}
                <circle className="motion-dot" cx="0" cy="0" r="3" fill="var(--bg-base)" />
              </svg>
            </div>
          </div>

          {/* Tile 4: Wide Span */}
          <div className="bento-tile md:col-span-1 md:row-span-1 rounded-3xl bg-white border border-accent-ink/30 p-8 flex flex-col justify-between opacity-0">
             <div>
              <h3 className="font-display font-bold text-xl text-text-primary mb-2">Local First</h3>
              <p className="font-body text-text-muted text-sm">Offline capable sync.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
