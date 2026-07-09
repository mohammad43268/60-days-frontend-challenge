import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);
  const lineRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      gsap.set(wordsRef.current, { yPercent: 100, opacity: 0 });

      tl.to(wordsRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out'
      });

      tl.to({ value: 0 }, {
        value: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: function () {
          const val = Math.round(this.targets()[0].value);
          setProgress(val);
          if (lineRef.current) {
            lineRef.current.style.transform = `scaleX(${val / 100})`;
          }
        }
      }, '-=0.5');

      tl.to(wordsRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.in'
      });

      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut'
      }, '-=0.3');
    });

    return () => ctx.revert();
  }, [onComplete]);

  const words = ['NOIR', 'ATELIER'];

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: '#050505',
        color: '#E9E5D6',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'var(--font-display)'
      }}
    >
      <div style={{ overflow: 'hidden', display: 'flex', gap: '2rem', marginBottom: '4rem' }}>
        {words.map((word, i) => (
          <span 
            key={i}
            ref={(el) => wordsRef.current[i] = el}
            style={{ 
              fontSize: 'clamp(4rem, 12vw, 12rem)', 
              letterSpacing: '0.15em',
              lineHeight: 1
            }}
          >
            {word}
          </span>
        ))}
      </div>

      <div style={{ 
        width: '200px', 
        height: '1px', 
        backgroundColor: 'rgba(255,255,255,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div 
          ref={lineRef}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'var(--accent-gold)',
            transformOrigin: 'left center',
            transform: 'scaleX(0)'
          }}
        />
      </div>

      <div style={{ 
        marginTop: '1.5rem',
        fontSize: '0.9rem', 
        letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic'
      }}>
        {progress}%
      </div>
    </div>
  );
};

export default Preloader;
