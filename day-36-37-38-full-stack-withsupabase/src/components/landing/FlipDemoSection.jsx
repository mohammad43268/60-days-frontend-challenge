import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export const FlipDemoSection = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      // Spatial floating animation for the cards
      const cards = gsap.utils.toArray('.spatial-card');

      cards.forEach((card, i) => {
        // Create a random organic floating motion for each card
        gsap.to(card, {
          y: `+=${Math.random() * 15 + 10}`,
          x: `+=${Math.random() * 10 - 5}`,
          rotation: Math.random() * 4 - 2,
          duration: Math.random() * 2 + 3,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
      });
    },
    { scope: containerRef }
  );

  const mockData = [
    {
      id: 1,
      title: 'Project Alpha',
      status: 'Active',
      color: 'bg-orange-200',
      assignee: 'JD',
      priority: 'High',
      priorityColor: 'text-red-600 bg-red-100',
      dueDate: 'Nov 24',
    },
    {
      id: 2,
      title: 'Design System',
      status: 'Review',
      color: 'bg-blue-200',
      assignee: 'AM',
      priority: 'Medium',
      priorityColor: 'text-orange-600 bg-orange-100',
      dueDate: 'Nov 26',
    },
    {
      id: 3,
      title: 'Backend API',
      status: 'Planning',
      color: 'bg-green-200',
      assignee: 'SB',
      priority: 'High',
      priorityColor: 'text-red-600 bg-red-100',
      dueDate: 'Dec 02',
    },
    {
      id: 4,
      title: 'User Testing',
      status: 'Done',
      color: 'bg-purple-200',
      assignee: 'JD',
      priority: 'Low',
      priorityColor: 'text-blue-600 bg-blue-100',
      dueDate: 'Nov 18',
    },
    {
      id: 5,
      title: 'Marketing Assets',
      status: 'Active',
      color: 'bg-pink-200',
      assignee: 'KL',
      priority: 'Medium',
      priorityColor: 'text-orange-600 bg-orange-100',
      dueDate: 'Dec 05',
    },
    {
      id: 6,
      title: 'Security Audit',
      status: 'Planning',
      color: 'bg-yellow-200',
      assignee: 'SB',
      priority: 'High',
      priorityColor: 'text-red-600 bg-red-100',
      dueDate: 'Dec 15',
    },
  ];

  return (
    <section className="parallax-section relative z-10 w-full py-32 bg-[#0A0A0B] text-white px-4 sm:px-6 lg:px-8 -mt-16 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-accent-ink/20">
      <div className="max-w-6xl mx-auto flex flex-col items-center" ref={containerRef}>
        <div className="text-center mb-16 relative z-10">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-tight mb-4">
            Infinite Spatial Canvas
          </h2>
          <p className="font-body text-text-muted max-w-2xl mx-auto">
            Break out of restrictive linear documents. Map your architecture, link dependencies, and
            visually structure your workflow in a boundless 2D space.
          </p>
        </div>

        {/* Spatial Container */}
        <div className="relative w-full max-w-5xl h-[600px] rounded-[2rem] border border-white/10 overflow-x-auto overflow-y-hidden bg-[#161618]/50 shadow-inner custom-scrollbar">
          <div className="relative w-[1000px] md:w-full h-full p-8">
            {/* Subtle Grid Background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.5,
              }}
            ></div>

            {mockData.map((item, index) => (
              <div
                key={item.id}
                className="spatial-card absolute flex-col p-5 w-72 rounded-2xl border border-accent-ink/10 bg-white shadow-[0_15px_40px_rgb(0,0,0,0.1)] hover:shadow-[0_25px_60px_rgb(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.03] cursor-grab active:cursor-grabbing hover:z-40"
                style={{
                  top: `${(index % 2) * 180 + 60 + (index > 3 ? 80 : 0)}px`,
                  left: `${(index % 3) * 280 + 30 + (index % 2) * 30}px`,
                  zIndex: index,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex-shrink-0 shadow-inner ${item.color}`}
                  ></div>
                  <div className="font-display font-bold text-text-primary text-[1.1rem] leading-tight">
                    {item.title}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-surface border border-accent-ink/10 text-text-muted text-xs font-semibold shadow-sm">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-accent-ink/10">
                  <div className="">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.priorityColor}`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#161618] text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                      {item.assignee}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
