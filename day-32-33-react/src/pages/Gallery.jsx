import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { images } from '../data/images';

gsap.registerPlugin(ScrollTrigger);

const Gallery = () => {
  const containerRef = useRef(null);
  const galleryRef = useRef(null);

  const galleryImages = images.filter(img => img.category === 'Archive');

  const pathRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.gallery-item');

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        pin: true,
        start: 'top top',
        end: () => `+=${galleryRef.current.offsetWidth}`,
        scrub: 1,
        animation: gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: 'none'
        })
      });

      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${galleryRef.current.offsetWidth}`,
            scrub: 1
          }
        });
      }

      sections.forEach((section) => {
        const img = section.querySelector('img');
        gsap.fromTo(img, 
          { x: '-20vw' },
          {
            x: '20vw',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              containerAnimation: st.animation,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          }
        );
      });

      // Liquid Scroll Distortion for Gallery
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          gsap.to('.gallery-image-wrapper', {
            skewX: velocity * -0.003,
            scale: 1 + Math.abs(velocity * 0.000015),
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    });

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timeout);
      ctx.revert();
    };
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>
      <main ref={containerRef} style={{ backgroundColor: '#050505', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      <svg 
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100vw',
          height: '100px',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1000 100"
      >
        <path 
          ref={pathRef}
          d="M 0 50 L 1000 50"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="2"
          style={{ opacity: 0.5 }}
        />
      </svg>

      <div 
        ref={galleryRef}
        style={{ 
          display: 'flex', 
          height: '100%', 
          width: `${galleryImages.length * 100}vw`,
          alignItems: 'center'
        }}
      >

        <div className="gallery-item" style={{ width: '100vw', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
           <h1 style={{ 
            fontSize: 'clamp(4rem, 15vw, 15rem)', 
            color: 'var(--accent-gold)',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1
          }}>
            The <br/>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--text-primary)' }}>Gallery</span>
          </h1>
          <p style={{ position: 'absolute', bottom: '10%', right: '10%', color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            Scroll to explore &#x2192;
          </p>
        </div>

        {galleryImages.map((img, i) => (
          <div 
            key={img.id} 
            className="gallery-item" 
            style={{ 
              width: '100vw', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '0 5vw',
              position: 'relative'
            }}
          >
            <div className="gallery-image-wrapper" style={{ width: '100%', height: '70vh', transformOrigin: 'center center' }}>
              <div className="image-hover-wrapper" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={img.url} 
                  alt={img.alt}
                  data-cursor-text="DRAG" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center 15%',
                    transform: 'scale(1.2)'
                  }}
                />
              </div>
            </div>

            <h2 style={{ 
              position: 'absolute', 
              bottom: '5%', 
              left: '10%', 
              fontSize: '4rem', 
              fontFamily: 'var(--font-display)',
              mixBlendMode: 'difference',
              color: 'var(--text-primary)',
              zIndex: 10
            }}>
              0{i + 1}
            </h2>
          </div>
        ))}
        
      </div>
      </main>
    </div>
  );
};

export default Gallery;
