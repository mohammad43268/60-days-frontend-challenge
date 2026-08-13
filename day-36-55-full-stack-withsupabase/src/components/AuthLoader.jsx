import React, { useState, useEffect } from 'react';
import { Hexagon, Network, Zap } from 'lucide-react';

const LOADING_PHRASES = [
  "INITIALIZING ZAFORGE KERNEL...",
  "ESTABLISHING NEURAL LINKS...",
  "ALIGNING SPATIAL NODES...",
  "SYNCING WORKSPACE STATE...",
  "PREPARING INFINITE CANVAS..."
];

export const AuthLoader = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden selection:bg-transparent">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Core Animation Group */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-12">
          {/* Outer Rotating Ring */}
          <div className="absolute inset-0 border-t-2 border-r-2 border-orange-500/80 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute inset-2 border-b-2 border-l-2 border-orange-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
          
          {/* Dotted Orbit */}
          <div className="absolute inset-4 border border-dashed border-white/20 rounded-full animate-spin" style={{ animationDuration: '10s' }} />

          {/* Central Logo / Icon */}
          <div className="relative flex items-center justify-center bg-[#050505] w-16 h-16 rounded-full border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <Hexagon className="w-8 h-8 text-orange-500 animate-pulse" />
            <Zap className="w-3 h-3 text-white absolute center opacity-80" />
          </div>

          {/* Floating Nodes */}
          <div className="absolute -top-4 -right-4 w-3 h-3 bg-orange-400 rounded-full animate-bounce shadow-[0_0_10px_#f97316]" style={{ animationDelay: '0ms' }} />
          <div className="absolute -bottom-4 -left-4 w-2 h-2 bg-white rounded-full animate-bounce shadow-[0_0_10px_#ffffff]" style={{ animationDelay: '300ms' }} />
          <div className="absolute top-1/2 -right-8 w-2 h-2 bg-orange-500/50 rounded-full animate-ping" style={{ animationDelay: '600ms' }} />
        </div>

        {/* Dynamic Text Section */}
        <div className="flex flex-col items-center h-16">
          <div className="flex items-center space-x-3 mb-3">
            <Network className="w-4 h-4 text-orange-500/70 animate-pulse" />
            <span className="text-white/40 font-mono text-[10px] tracking-[0.4em] uppercase">
              System Status
            </span>
            <div className="flex space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
          
          {/* Fading Phrase */}
          <div className="relative h-6 w-full flex justify-center">
            {LOADING_PHRASES.map((phrase, idx) => (
              <h2
                key={idx}
                className={`absolute w-[300px] text-center text-orange-500 font-mono text-xs tracking-widest transition-all duration-700 ease-in-out ${
                  idx === phraseIndex ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-4 scale-95 pointer-events-none'
                }`}
              >
                {phrase}
              </h2>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
