import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './landing/HeroSection';
import { FlipDemoSection } from './landing/FlipDemoSection';
import { DragDemoSection } from './landing/DragDemoSection';
import { PinnedManifestoSection } from './landing/PinnedManifestoSection';
import { BentoGridSection } from './landing/BentoGridSection';
import { FooterSection } from './landing/FooterSection';
import { Loader2 } from 'lucide-react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  
  const containerRef = useRef(null);

  useEffect(() => {
    // 0. Enable native window scrolling for the landing page (overriding the canvas app constraints)
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    // Clear out any previous HMR scroller defaults
    ScrollTrigger.defaults({ scroller: window });

    // 1. Initialize Lenis for Smooth Scrolling natively on the window
    const lenis = new Lenis({
      duration: 1.0, // Tighter duration for more responsiveness
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // 2. Synchronize Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 3. Synchronize Lenis requestAnimationFrame with GSAP's ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // GSAP ticker provides time in seconds, Lenis needs ms
    });

    // Wait for fonts/images to load, then refresh ScrollTrigger
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
      lenis.resize(); // Force Lenis to recalculate its bounds
    });

    // Fallback resize for dynamic CSS injections (e.g. height: auto)
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
      lenis.resize();
    }, 100);

    return () => {
      // Cleanup
      document.body.style.overflow = 'hidden'; // Restore canvas bounds
      gsap.ticker.remove((time) => { lenis.raf(time * 1000); });
      lenis.destroy();
    };
  }, []);

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
    <div className="w-full bg-bg-base text-text-primary selection:bg-accent-ink selection:text-text-primary">
      
      <LandingNavbar onLoginClick={() => setIsAuthModalOpen(true)} />

      <main ref={containerRef} className="relative z-10 w-full">
        <HeroSection onLoginClick={() => setIsAuthModalOpen(true)} />
        <FlipDemoSection />
        <DragDemoSection />
        <PinnedManifestoSection />
        <BentoGridSection />
        <FooterSection />
      </main>

      {/* Neumorphic Auth Modal (Retained legacy functionality but updated aesthetics slightly) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-10 md:p-12 shadow-2xl border border-accent-ink/20">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface hover:bg-bg-warm flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
            >
              ✕
            </button>
            
            <div className="mb-12 text-center mt-4">
              <h2 className="font-display font-bold text-2xl tracking-tight text-text-primary mb-2">ACCESS PORTAL</h2>
              <p className="font-body text-text-muted text-xs tracking-widest uppercase font-medium">Secure your workspace</p>
            </div>

            {authSuccess && !authMessage ? (
              <div className="bg-bg-warm text-text-primary p-8 rounded-2xl text-center space-y-4">
                <p className="font-bold tracking-wider text-sm">MAGIC LINK DEPLOYED</p>
                <p className="text-xs text-text-muted font-medium">CHECK YOUR INBOX</p>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-3 bg-text-primary text-bg-base py-4 px-6 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/></svg>
                      Continue with Google
                    </>
                  )}
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-accent-ink/30"></div>
                  <span className="flex-shrink-0 mx-4 text-text-muted text-xs font-medium uppercase">Or</span>
                  <div className="flex-grow border-t border-accent-ink/30"></div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-surface/50 border border-accent-ink/50 rounded-xl px-6 py-4 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-text-primary transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 bg-surface text-text-primary border border-accent-ink py-4 px-6 rounded-xl text-sm font-medium hover:bg-bg-warm transition-colors disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : 'Send Magic Link'}
                  </button>
                </form>
                
                {authMessage && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs text-center font-medium">
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
