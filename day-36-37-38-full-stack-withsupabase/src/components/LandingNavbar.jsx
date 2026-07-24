import React, { forwardRef, useRef } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export const LandingNavbar = forwardRef(({ onLoginClick }, forwardedRef) => {
  const user = usePlannerStore((state) => state.user);
  const setRoute = usePlannerStore((state) => state.setRoute);

  const logoRef = useRef(null);
  const btnRef = useRef(null);
  const navContainerRef = useRef(null);
  const navOuterRef = useRef(null);
  const lastScrollY = useRef(0);

  useGSAP(() => {
    // 0. Smart Scroll Hide/Show
    if (navOuterRef.current) {
      const handleScroll = () => {
        const currentY = window.scrollY;

        if (currentY > lastScrollY.current && currentY > 20) {
          gsap.to(navOuterRef.current, { y: -150, duration: 0.3, ease: 'power3.inOut' });
        } else if (currentY < lastScrollY.current) {
          gsap.to(navOuterRef.current, { y: 0, duration: 0.3, ease: 'power3.out' });
        }

        lastScrollY.current = currentY;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // 1. Magnetic Effect for the Sign In Button
    if (btnRef.current) {
      const btn = btnRef.current;
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        xTo((relX - rect.width / 2) * 0.2);
        yTo((relY - rect.height / 2) * 0.2);
      });

      btn.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    }

    // 2. Logo Hover
    if (logoRef.current) {
      const logo = logoRef.current;
      logo.addEventListener('mouseenter', () =>
        gsap.to(logo, { scale: 1.05, duration: 0.4, ease: 'back.out(2)' })
      );
      logo.addEventListener('mouseleave', () =>
        gsap.to(logo, { scale: 1, duration: 0.4, ease: 'power3.out' })
      );
    }
  });

  return (
    <nav
      ref={(el) => {
        navOuterRef.current = el;
        if (typeof forwardedRef === 'function') forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4"
    >
      <div
        ref={navContainerRef}
        className="flex items-center justify-between bg-surface/80 backdrop-blur-xl rounded-full px-8 py-4 shadow-xl border border-accent-ink/30 transition-all duration-300 hover:bg-surface"
      >
        {/* Minimal Logo */}
        <div
          ref={logoRef}
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setRoute('canvas')}
        >
          <span className="font-display font-bold text-2xl tracking-tighter text-text-primary uppercase flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            ZAFORGE
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6">
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                usePlannerStore.getState().setUser(null);
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-surface border border-accent-ink text-text-primary font-body text-sm font-medium uppercase tracking-wider hover:bg-bg-warm transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <button
              ref={btnRef}
              onClick={onLoginClick}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-text-primary text-bg-base font-body text-sm font-medium uppercase tracking-wider hover:bg-black transition-colors shadow-lg group"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
});
