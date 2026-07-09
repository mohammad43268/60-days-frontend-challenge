import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isMouse = window.matchMedia('(pointer: fine)').matches;
    if (isMouse) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !cursorRef.current) return;

    // Initialize GSAP transform properties cleanly before any animation
    gsap.set(cursorRef.current, { 
      xPercent: -50, 
      yPercent: -50,
      x: window.innerWidth / 2, // Start in middle to avoid corner spawn
      y: window.innerHeight / 2
    });

    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });

    const onMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onMouseOver = (e) => {
      const target = e.target.closest('[data-cursor-text], a, button');
      
      if (target) {
        const text = target.getAttribute('data-cursor-text');
        
        if (text) {
         
          textRef.current.innerText = text;
          gsap.to(cursorRef.current, {
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--accent-gold)',
            mixBlendMode: 'normal',
            duration: 0.3,
            ease: 'power3.out',
          });
          gsap.to(textRef.current, {
            opacity: 1,
            duration: 0.3
          });
        } else {
         
          gsap.to(cursorRef.current, {
            width: '50px',
            height: '50px',
            duration: 0.3,
            ease: 'power3.out',
          });
        }
      }
    };

    const onMouseOut = (e) => {
      gsap.to(cursorRef.current, {
        width: '20px',
        height: '20px',
        backgroundColor: '#fff',
        mixBlendMode: 'difference',
        duration: 0.3,
        ease: 'power3.out',
      });
      gsap.to(textRef.current, {
        opacity: 0,
        duration: 0.3
      });
      setTimeout(() => {
        if (textRef.current) textRef.current.innerText = '';
      }, 300);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span 
        ref={textRef}
        style={{
          opacity: 0,
          color: '#000',
          fontFamily: 'var(--font-display)',
          fontSize: '0.9rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          display: 'block'
        }}
      >
      </span>
    </div>
  );
};

export default CustomCursor;
