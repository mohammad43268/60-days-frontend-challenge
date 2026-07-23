import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(Flip, MorphSVGPlugin);

export const FlipDemoSection = () => {
  const [view, setView] = useState('canvas'); // 'canvas' or 'table'
  const containerRef = useRef(null);
  
  const iconRef = useRef(null);
  const pathRef = useRef(null);

  useGSAP(() => {
    // Morph the icon based on the view
    if (view === 'canvas') {
      gsap.to(pathRef.current, {
        morphSVG: "M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z", // Grid icon
        duration: 0.6,
        ease: 'power3.inOut'
      });
    } else {
      gsap.to(pathRef.current, {
        morphSVG: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z", // List icon
        duration: 0.6,
        ease: 'power3.inOut'
      });
    }

    // Capture the state of all elements to animate with Flip
    const state = Flip.getState('.flip-item, .flip-container');
    
    // Animate the transition between layout states
    Flip.from(state, {
      duration: 0.8,
      ease: 'power4.inOut',
      stagger: 0.05,
      absolute: true,
      toggleClass: 'flipping',
      onEnter: elements => gsap.fromTo(elements, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.4}),
      onLeave: elements => gsap.to(elements, {opacity: 0, scale: 0.9, duration: 0.3})
    });
    
  }, { scope: containerRef, dependencies: [view] });

  const mockData = [
    { id: 1, title: 'Project Alpha', status: 'Active', color: 'bg-orange-200' },
    { id: 2, title: 'Design System', status: 'Review', color: 'bg-blue-200' },
    { id: 3, title: 'Backend API', status: 'Planning', color: 'bg-green-200' },
    { id: 4, title: 'User Testing', status: 'Done', color: 'bg-purple-200' },
  ];

  return (
    <section className="relative w-full py-32 bg-bg-warm px-4 sm:px-6 lg:px-8 border-y border-accent-ink/20">
      <div className="max-w-6xl mx-auto flex flex-col items-center" ref={containerRef}>
        
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-text-primary uppercase tracking-tight mb-4">
            Polymorphic Views
          </h2>
          <p className="font-body text-text-muted max-w-2xl mx-auto">
            View your data spatially on the canvas, or instantly pivot to structured tables. Zero friction, one truth.
          </p>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setView(view === 'canvas' ? 'table' : 'canvas')}
          className="mb-12 flex items-center gap-3 px-6 py-3 rounded-full bg-surface border border-accent-ink/50 text-text-primary hover:bg-white transition-colors"
        >
          <svg ref={iconRef} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            {/* Start as a Grid */}
            <path ref={pathRef} d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
          </svg>
          <span className="font-body font-medium text-sm">
            Toggle to {view === 'canvas' ? 'Table' : 'Canvas'}
          </span>
        </button>

        {/* Flip Container */}
        <div className={`flip-container relative w-full max-w-4xl min-h-[400px] p-8 rounded-3xl border border-accent-ink/30 bg-bg-base overflow-hidden transition-colors ${view === 'table' ? 'flex flex-col gap-2' : ''}`}>
          
          {/* Header row for table view */}
          {view === 'table' && (
            <div className="flip-item grid grid-cols-4 gap-4 px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-accent-ink/20 mb-4">
              <div className="col-span-2">Task</div>
              <div>Status</div>
              <div>ID</div>
            </div>
          )}

          {mockData.map((item, index) => (
            <div 
              key={item.id}
              className={`flip-item p-6 rounded-2xl border border-accent-ink/20 bg-white shadow-sm flex ${
                view === 'canvas' 
                  ? 'absolute cursor-move flex-col gap-4 w-64' // Canvas styles (absolute positioned blocks)
                  : 'relative items-center grid grid-cols-4 gap-4 w-full cursor-pointer hover:bg-surface/50' // Table styles (rows)
              }`}
              style={view === 'canvas' ? {
                top: `${(index % 2) * 150 + 50}px`,
                left: `${(index % 2 === 0 ? index * 100 + 50 : index * 150 + 200)}px`
              } : {}}
            >
              <div className={`${view === 'canvas' ? 'flex flex-col' : 'col-span-2 flex items-center gap-4'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${item.color}`}></div>
                <div className="font-display font-bold text-text-primary text-lg mt-2 lg:mt-0">{item.title}</div>
              </div>
              <div className={`${view === 'canvas' ? 'mt-4' : ''}`}>
                <span className="px-3 py-1 rounded-full bg-surface text-text-muted text-xs font-medium">
                  {item.status}
                </span>
              </div>
              {view === 'table' && (
                <div className="text-text-muted font-mono text-sm">
                  #{item.id.toString().padStart(4, '0')}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};
