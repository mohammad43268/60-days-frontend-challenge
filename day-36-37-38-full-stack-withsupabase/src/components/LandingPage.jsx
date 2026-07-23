import React, { useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { LandingNavbar } from './LandingNavbar';
import { supabase } from '../lib/supabase';
import { Layout, TableProperties, Zap, ArrowRight, Loader2 } from 'lucide-react';

export const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    setAuthSuccess(true);
    setAuthMessage('');
    setAuthLoading(true);
    supabase.auth.signInWithOtp({ email }).then(({ error }) => {
      setAuthLoading(false);
      if (error) {
        setAuthSuccess(false);
        setAuthMessage(error.message);
      }
    });
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#EAECEF] text-[#1A1A1A] font-sans tracking-wide landing-scrollbar">
      
      <LandingNavbar onLoginClick={() => setIsAuthModalOpen(true)} />

      <main className="flex flex-col items-center pt-56 pb-48 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mt-20">
          
          <h1 className="text-4xl md:text-[5rem] font-light tracking-tight leading-tight mb-14 text-[#1A1A1A]">
            A minimalist canvas<br />for infinite thoughts.
          </h1>
          
          <p className="text-lg md:text-xl text-[#1A1A1A]/60 mb-20 max-w-2xl mx-auto leading-loose font-light">
            Strip away the noise. Zaforge provides a pure, unhindered space to architect your ideas, structure data, and map workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-12 py-5 rounded-full bg-[#EAECEF] text-[#1A1A1A] font-medium tracking-[0.25em] text-xs shadow-[10px_10px_20px_#c8cacc,-10px_-10px_20px_#ffffff] hover:shadow-[inset_8px_8px_16px_#c8cacc,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 flex items-center justify-center gap-4 group"
            >
              START BUILDING <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        {/* Minimal Features Grid */}
        <div className="mt-56 w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            
            <div className="p-12 rounded-[2.5rem] bg-[#EAECEF] shadow-[inset_8px_8px_16px_#c8cacc,inset_-8px_-8px_16px_#ffffff] flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#EAECEF] shadow-[8px_8px_16px_#c8cacc,-8px_-8px_16px_#ffffff] flex items-center justify-center mb-10">
                <Layout className="w-8 h-8 text-[#1A1A1A]/50" />
              </div>
              <h3 className="text-xs font-bold tracking-[0.3em] mb-6 text-[#1A1A1A]/80">SPATIAL</h3>
              <p className="text-[#1A1A1A]/60 text-sm leading-loose font-light">Infinite freedom to position your ideas in a boundless 2D space.</p>
            </div>
            
            <div className="p-12 rounded-[2.5rem] bg-[#EAECEF] shadow-[inset_8px_8px_16px_#c8cacc,inset_-8px_-8px_16px_#ffffff] flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#EAECEF] shadow-[8px_8px_16px_#c8cacc,-8px_-8px_16px_#ffffff] flex items-center justify-center mb-10">
                <TableProperties className="w-8 h-8 text-[#1A1A1A]/50" />
              </div>
              <h3 className="text-xs font-bold tracking-[0.3em] mb-6 text-[#1A1A1A]/80">STRUCTURE</h3>
              <p className="text-[#1A1A1A]/60 text-sm leading-loose font-light">Toggle into table or timeline views to structure your abstract concepts.</p>
            </div>

            <div className="p-12 rounded-[2.5rem] bg-[#EAECEF] shadow-[inset_8px_8px_16px_#c8cacc,inset_-8px_-8px_16px_#ffffff] flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#EAECEF] shadow-[8px_8px_16px_#c8cacc,-8px_-8px_16px_#ffffff] flex items-center justify-center mb-10">
                <Zap className="w-8 h-8 text-[#1A1A1A]/50" />
              </div>
              <h3 className="text-xs font-bold tracking-[0.3em] mb-6 text-[#1A1A1A]/80">SPEED</h3>
              <p className="text-[#1A1A1A]/60 text-sm leading-loose font-light">Unobtrusive and lightweight. Runs at a silky 60fps.</p>
            </div>
            
          </div>
        </div>
      </main>

      {/* Neumorphic Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#EAECEF]/80 backdrop-blur-md">
          
          <div className="relative w-full max-w-md bg-[#EAECEF] rounded-[2.5rem] p-10 md:p-12 shadow-[12px_12px_24px_#c8cacc,-12px_-12px_24px_#ffffff]">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#EAECEF] shadow-[6px_6px_12px_#c8cacc,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#c8cacc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-all"
            >
              ✕
            </button>
            
            <div className="mb-14 text-center mt-4">
              <h2 className="text-xl font-medium tracking-[0.25em] text-[#1A1A1A] mb-3">ACCESS PORTAL</h2>
              <p className="text-[#1A1A1A]/40 text-[10px] tracking-[0.3em] font-bold">SECURE YOUR WORKSPACE</p>
            </div>

            {authSuccess && !authMessage ? (
              <div className="bg-[#EAECEF] shadow-[inset_6px_6px_12px_#c8cacc,inset_-6px_-6px_12px_#ffffff] text-[#1A1A1A]/80 p-10 rounded-[2rem] text-center space-y-6">
                <p className="font-medium tracking-[0.2em] text-xs">MAGIC LINK DEPLOYED</p>
                <p className="text-[10px] text-[#1A1A1A]/50 tracking-[0.25em] font-bold">CHECK YOUR INBOX</p>
              </div>
            ) : (
              <div className="space-y-8">
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-4 bg-[#EAECEF] text-[#1A1A1A] py-5 px-6 rounded-full text-xs font-medium tracking-[0.25em] shadow-[8px_8px_16px_#c8cacc,-8px_-8px_16px_#ffffff] hover:shadow-[inset_6px_6px_12px_#c8cacc,inset_-6px_-6px_12px_#ffffff] transition-all disabled:opacity-50"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : (
                    <>
                      <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/></svg>
                      GOOGLE AUTH
                    </>
                  )}
                </button>
                
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-[#c8cacc] shadow-[0_1px_0_#ffffff]"></div>
                  <span className="flex-shrink-0 mx-6 text-[#1A1A1A]/30 text-[10px] tracking-[0.4em] font-bold">OR</span>
                  <div className="flex-grow border-t border-[#c8cacc] shadow-[0_1px_0_#ffffff]"></div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER EMAIL"
                      className="w-full bg-[#EAECEF] shadow-[inset_6px_6px_12px_#c8cacc,inset_-6px_-6px_12px_#ffffff] rounded-full px-8 py-5 text-[#1A1A1A] placeholder-[#1A1A1A]/30 text-xs tracking-[0.25em] font-bold focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-4 bg-[#EAECEF] text-[#1A1A1A] py-5 px-6 rounded-full text-xs font-medium tracking-[0.25em] shadow-[8px_8px_16px_#c8cacc,-8px_-8px_16px_#ffffff] hover:shadow-[inset_6px_6px_12px_#c8cacc,inset_-6px_-6px_12px_#ffffff] transition-all disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : 'INITIATE LINK'}
                  </button>
                </form>
                
                {authMessage && (
                  <div className="mt-6 p-5 bg-[#EAECEF] shadow-[inset_4px_4px_8px_#c8cacc,inset_-4px_-4px_8px_#ffffff] text-red-500 rounded-[1.5rem] text-[10px] tracking-[0.25em] text-center font-bold uppercase">
                    {authMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
