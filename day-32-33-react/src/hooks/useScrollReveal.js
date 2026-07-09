import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = (selector, options = {}) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(elements, 
      {
        y: options.y || 50,
        opacity: options.opacity || 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: options.duration || 1,
        stagger: options.stagger || 0.1,
        ease: options.ease || 'power3.out',
        scrollTrigger: {
          trigger: options.trigger || elements[0],
          start: options.start || 'top 80%',
          end: options.end || 'bottom 20%',
          toggleActions: 'play none none none',
          ...options.scrollTrigger
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {

      });
    };
  }, [selector, options]);
};
