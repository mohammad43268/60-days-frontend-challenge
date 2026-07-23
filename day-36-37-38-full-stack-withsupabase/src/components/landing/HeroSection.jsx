import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(SplitText, DrawSVGPlugin);

export const HeroSection = ({ onLoginClick }) => {
  const heroRef = useRef(null);

  useGSAP(() => {
    // 1. Split Text Entrance
    const split = new SplitText('.hero-title', { type: 'words,chars' });
    
    // Set up initial state for characters (clipped mask wipe effect)
    gsap.set(split.chars, { 
      yPercent: 100, 
      opacity: 0,
      clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' // Start fully clipped
    });

    gsap.to(split.chars, {
      yPercent: 0,
      opacity: 1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', // Reveal full
      duration: 1.2,
      stagger: 0.02,
      ease: 'power4.out',
      delay: 0.2
    });

    // Fade in paragraph and button
    gsap.from('.hero-fade', {
      y: 30,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.8
    });

    // 2. Abstract SVG Node/Graph Illustration (DrawSVG)
    // Draw in the lines of the SVG
    gsap.from('.node-path', {
      drawSVG: '0%',
      duration: 2.5,
      ease: 'power3.inOut',
      stagger: 0.1,
      delay: 0.5
    });

    // Fade in the connection nodes
    gsap.from('.node-circle', {
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.5)',
      stagger: 0.1,
      delay: 1.5
    });

  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Abstract Animated SVG Graph Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30">
        <svg width="800" height="600" viewBox="0 0 800 600" className="opacity-60 scale-125 md:scale-100">
          <g stroke="var(--accent-ink)" strokeWidth="1.5" fill="none">
            <path className="node-path" d="M 100 300 C 200 200, 300 400, 400 300 S 600 200, 700 300" />
            <path className="node-path" d="M 250 150 C 350 250, 450 150, 550 250 S 650 450, 400 450" />
            <path className="node-path" d="M 400 100 Q 500 300 300 500" />
          </g>
          <g fill="var(--text-primary)">
            <circle className="node-circle" cx="100" cy="300" r="4" />
            <circle className="node-circle" cx="400" cy="300" r="6" />
            <circle className="node-circle" cx="700" cy="300" r="4" />
            <circle className="node-circle" cx="250" cy="150" r="4" />
            <circle className="node-circle" cx="550" cy="250" r="5" />
            <circle className="node-circle" cx="400" cy="450" r="4" />
            <circle className="node-circle" cx="300" cy="500" r="4" />
            <circle className="node-circle" cx="400" cy="100" r="4" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
        
        <h1 className="hero-title font-display font-bold text-5xl md:text-[6.5rem] tracking-tighter leading-[1.05] mb-8 text-text-primary uppercase overflow-hidden">
          A minimalist canvas<br />for infinite thoughts.
        </h1>
        
        <p className="hero-fade font-body text-lg md:text-xl text-text-muted mb-16 max-w-2xl mx-auto leading-relaxed">
          Strip away the noise. Zaforge provides a pure, unhindered space to architect your ideas, structure data, and map workflows with absolute clarity.
        </p>
        
        <div className="hero-fade flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={onLoginClick}
            className="px-10 py-4 rounded-full bg-text-primary text-bg-base font-body font-medium tracking-wide text-sm hover:bg-black transition-colors duration-300 flex items-center gap-3 group shadow-xl"
          >
            Start Building 
            <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a 
            href="https://github.com/mohammad43268/60-days-frontend-challenge/tree/main/day-36-37-38-full-stack-withsupabase#readme" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-10 py-4 rounded-full bg-transparent border border-accent-ink text-text-primary font-body font-medium tracking-wide text-sm hover:bg-surface transition-colors duration-300 flex items-center justify-center"
          >
            Docs
          </a>
        </div>
      </div>
    </section>
  );
};
