import React from 'react';

export const PinnedManifestoSection = () => {
  return (
    <section className="relative w-full min-h-screen bg-text-primary text-bg-base flex flex-col items-center justify-center overflow-hidden py-32">
      
      <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center pointer-events-none">
        {/* Subtle background glow/gradient */}
        <div className="w-[80vw] h-[80vw] rounded-full bg-accent-ink blur-[100px] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <p className="font-display font-bold text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[1.1] mb-8">
          Software shouldn't dictate how you think.
        </p>
        <p className="font-display font-bold text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[1.1] mb-8">
          Linear documents force linear thought.
        </p>
        <p className="font-display font-bold text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[1.1] text-bg-warm">
          Zaforge gives you back your space.
        </p>
      </div>
      
    </section>
  );
};
