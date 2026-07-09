import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { images } from '../data/images';

const MouseTrail = () => {
  const containerRef = useRef(null);
  const trailImages = useRef([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const currentIndex = useRef(0);
  const distanceThreshold = 100;

  // Select a subset of highly visual images
  const pool = images.filter(img => img.category === 'Hero' || img.category === 'Formal').slice(0, 15);

  useEffect(() => {
    const isMouse = window.matchMedia('(pointer: fine)').matches;
    if (!isMouse) return;

    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      
      const dx = x - lastPos.current.x;
      const dy = y - lastPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > distanceThreshold) {
        lastPos.current = { x, y };

        const img = trailImages.current[currentIndex.current];
        if (!img) return;

        // Reset any ongoing animations for this specific image
        gsap.killTweensOf(img);

        const randomRotation = gsap.utils.random(-25, 25);
        const randomScale = gsap.utils.random(0.5, 1.2);

        gsap.fromTo(img, 
          { 
            x: x - img.offsetWidth / 2, 
            y: y - img.offsetHeight / 2, 
            opacity: 1, 
            scale: randomScale,
            rotation: randomRotation,
            zIndex: gsap.utils.random(10, 50, 1)
          },
          {
            y: "+=150",
            opacity: 0,
            scale: randomScale * 0.5,
            duration: 1.2,
            ease: "power2.out"
          }
        );

        currentIndex.current = (currentIndex.current + 1) % pool.length;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [pool.length]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden'
      }}
    >
      {pool.map((img, i) => (
        <img 
          key={i}
          ref={el => trailImages.current[i] = el}
          src={img.url}
          alt="trail"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: 'clamp(100px, 15vw, 250px)',
            height: 'auto',
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        />
      ))}
    </div>
  );
};

export default MouseTrail;
