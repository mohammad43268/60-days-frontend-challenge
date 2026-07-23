import React, { forwardRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';

export const LandingNavbar = forwardRef(({ onLoginClick }, ref) => {
  const user = usePlannerStore(state => state.user);
  const setRoute = usePlannerStore(state => state.setRoute);

  return (
    <nav ref={ref} className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4">
      <div className="flex items-center justify-between bg-[#EAECEF] rounded-full px-8 py-4 shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff] border border-white/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#EAECEF] shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center">
             <img src="/logo.png" alt="Zaforge" className="h-4 w-auto filter opacity-80" />
          </div>
          <span className="text-[#1A1A1A] font-medium tracking-[0.25em] text-sm">ZAFORGE</span>
        </div>
        
        <div>
          {user ? (
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-[#1A1A1A]/50 font-mono tracking-widest hidden md:inline">
                SYS.USER // {user.user_metadata?.full_name || 'ACTIVE'}
              </span>
              <button 
                onClick={() => setRoute('app')}
                className="group flex items-center gap-3 bg-[#EAECEF] text-[#1A1A1A] px-6 py-2.5 rounded-full text-xs font-semibold tracking-[0.2em] shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] hover:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 active:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff]"
              >
                WORKSPACE
                <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { if (onLoginClick) onLoginClick(); }}
              className="group flex items-center gap-3 bg-[#EAECEF] text-[#1A1A1A] px-8 py-3 rounded-full text-xs font-semibold tracking-[0.2em] shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] hover:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 active:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff]"
            >
              SIGN IN
              <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
});

LandingNavbar.displayName = 'LandingNavbar';
