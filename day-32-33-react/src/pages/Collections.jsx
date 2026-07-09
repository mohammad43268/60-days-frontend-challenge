import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { images } from '../data/images';

const Collections = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const gridRef = useRef(null);
  
  const filters = ['All', 'Outerwear', 'Eveningwear', 'Editorial'];

  const gridItems = activeFilter === 'All'
    ? images.filter(img => img.category !== 'Formal')
    : images.filter(img => img.category === activeFilter);

  const pathRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current && gridItems.length > 0) {
        const cards = gridRef.current.children;
        gsap.fromTo(cards,
          { y: 100, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.05, ease: 'power4.out' }
        );
      }

      // Liquid Scroll Distortion
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          gsap.to('.collection-card-inner', {
            skewY: velocity * -0.002,
            scaleY: 1 + Math.abs(velocity * 0.00002),
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    });
    return () => ctx.revert();
  }, [activeFilter]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".collections-main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
          }
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const handleFilterClick = (filter) => {
    if (filter === activeFilter) return;
    
    if (gridRef.current && gridRef.current.children.length > 0) {
      gsap.to(gridRef.current.children, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete: () => {
          setActiveFilter(filter);
        }
      });
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <main className="collections-main" style={{ position: 'relative', paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh', paddingBottom: '10rem', overflow: 'hidden' }}>

      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1000 3000"
      >
        <path 
          ref={pathRef}
          className="collections-svg-path"
          d="M 200 0 C -100 1000, 1100 1500, 500 3000"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />
      </svg>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '6rem' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontFamily: 'var(--font-display)', marginBottom: '1rem', letterSpacing: '0.02em' }}>
          ARCHIVE
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Curated selections from the vault.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => handleFilterClick(filter)}
            style={{
              position: 'relative',
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              paddingBottom: '0.5rem',
              color: activeFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'color 0.3s ease'
            }}
          >
            {filter}
            <span 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '1px',
                backgroundColor: 'var(--text-primary)',
                transform: activeFilter === filter ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </button>
        ))}
      </div>

      {gridItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.5rem' }}>No pieces found in this category.</p>
        </div>
      ) : (
        <div 
          ref={gridRef}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gridAutoRows: '400px',
            gap: '3rem',
            gridAutoFlow: 'dense'
          }}
        >
          {gridItems.map((item, i) => {
           
            const isLarge = i % 5 === 0;
            const isWide = i % 7 === 0 && !isLarge;
            
            return (
              <div 
                key={item.id} 
                className="collection-card image-hover-wrapper"
                style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  gridColumn: isWide ? 'span 2' : (isLarge ? 'span 2' : 'span 1'),
                  gridRow: isLarge ? 'span 2' : 'span 1',
                  backgroundColor: '#111'
                }}
              >
                <div className="collection-card-inner" style={{ width: '100%', height: '100%', transformOrigin: 'center center' }}>
                  <img 
                    src={item.url} 
                    alt={item.alt} 
                    data-cursor-text="VIEW"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }} 
                  />
                
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0, left: 0, width: '100%',
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>
                    {item.category}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#fff', fontSize: '1.5rem' }}>
                    Edition 0{i + 1}
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Collections;
