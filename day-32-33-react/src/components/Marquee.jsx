import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Marquee = ({ text }) => {
  const containerRef = useRef(null);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({ repeat: -1 });

    tl.to([track1Ref.current, track2Ref.current], {
      xPercent: -100,
      ease: 'none',
      duration: 20
    });

    let currentDirection = 1;
    let lastScroll = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScroll;
      lastScroll = scrollY;

      const newDirection = diff > 0 ? 1 : -1;

      if (newDirection !== currentDirection) {
        currentDirection = newDirection;
        gsap.to(tl, {
          timeScale: currentDirection,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      const speed = Math.min(Math.abs(diff) * 0.03, 5);
      gsap.to(tl, {
        timeScale: currentDirection * Math.max(1, speed),
        duration: 0.8,
        ease: 'power2.out'
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      tl.kill();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const itemStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    flexShrink: 0
  };

  const separatorStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-gold)',
    flexShrink: 0,
    opacity: 0.6
  };

  const trackContent = (
    <>
      <span style={itemStyle}>{text}</span>
      <span style={separatorStyle} />
      <span style={{...itemStyle, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, opacity: 0.5}}>{text}</span>
      <span style={separatorStyle} />
    </>
  );

  return (
    <div
      ref={containerRef}
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        display: 'flex',
        padding: '3rem 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'transparent'
      }}
    >
      <div ref={track1Ref} style={{ display: 'flex', flexShrink: 0, gap: '3rem', alignItems: 'center', paddingRight: '3rem' }}>
        {trackContent}
        {trackContent}
      </div>
      <div ref={track2Ref} style={{ display: 'flex', flexShrink: 0, gap: '3rem', alignItems: 'center', paddingRight: '3rem' }}>
        {trackContent}
        {trackContent}
      </div>
    </div>
  );
};

export default Marquee;
