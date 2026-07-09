import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Marquee from '../components/Marquee';
import MouseTrail from '../components/MouseTrail';
import { images } from '../data/images';
import { useTransition } from '../context/TransitionContext';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const mainModelRef = useRef(null);
  const textRef = useRef(null);
  const leftImagesRef = useRef([]);
  const rightImagesRef = useRef([]);
  const { transitionTo } = useTransition();

  const heroImages = images.filter(img => img.category === 'Hero');
  const formalImages = images.filter(img => img.category === 'Formal');

  const addToLeft = (el) => { if (el && !leftImagesRef.current.includes(el)) leftImagesRef.current.push(el); };
  const addToRight = (el) => { if (el && !rightImagesRef.current.includes(el)) rightImagesRef.current.push(el); };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion) {
        const tl = gsap.timeline();

        tl.fromTo(mainModelRef.current, 
          { scale: 1.1, opacity: 0, y: 150 },
          { scale: 1, opacity: 1, y: 0, duration: 2, ease: 'power4.out' }
        )
        .fromTo(textRef.current,
          { opacity: 0, scale: 0.8, letterSpacing: '0em' },
          { opacity: 1, scale: 1, letterSpacing: '0.05em', duration: 1.5, ease: 'power3.out' },
          "-=1.5"
        );

        tl.fromTo(leftImagesRef.current,
          { x: '-80vw', y: 100, opacity: 0, rotation: -45 },
          { x: 0, y: 0, opacity: 1, rotation: () => gsap.utils.random(-25, 10), duration: 1.8, stagger: 0.15, ease: 'power4.out' },
          "-=1.5"
        );
        
        tl.fromTo(rightImagesRef.current,
          { x: '80vw', y: 100, opacity: 0, rotation: 45 },
          { x: 0, y: 0, opacity: 1, rotation: () => gsap.utils.random(-10, 25), duration: 1.8, stagger: 0.15, ease: 'power4.out' },
          "-=1.8"
        );

        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
          animation: gsap.fromTo(mainModelRef.current, 
            { scale: 1, y: 0, opacity: 1 },
            {
              scale: 1.3,
              y: 200,
              opacity: 0,
              ease: 'none',
              immediateRender: false
            }
          )
        });

        ScrollTrigger.create({
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
          animation: gsap.fromTo([...leftImagesRef.current, ...rightImagesRef.current], 
            { y: 0, rotation: (i) => leftImagesRef.current[i] ? gsap.getProperty(leftImagesRef.current[i], 'rotation') : 0, opacity: 1, scale: 1 },
            {
              y: (i) => (i % 2 === 0 ? -600 : 500),
              x: (i, target) => {
                 return leftImagesRef.current.includes(target) ? -800 : 800;
              },
              rotation: (i) => (i % 2 === 0 ? -90 : 90),
              opacity: 0,
              scale: 1.5,
              ease: 'power2.inOut',
              immediateRender: false
            }
          )
        });
       
        const homePaths = document.querySelectorAll('.home-svg-path');
        homePaths.forEach((path, i) => {
          const pathLength = path.getTotalLength();
          gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength, y: 100 });
          gsap.to(path, {
            strokeDashoffset: 0,
            y: -200,
            ease: 'none',
            scrollTrigger: {
              trigger: '.home-main',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 2.5 + (i * 0.8)
            }
          });
        });

        const geoCircles = document.querySelectorAll('.home-geo-circle');
        geoCircles.forEach((circle, i) => {
          gsap.fromTo(circle, 
            { y: 150, scale: 0.8, opacity: 0 },
            {
              y: -250,
              scale: i % 2 === 0 ? 1.2 : 0.9,
              opacity: 0.25,
              rotation: i % 2 === 0 ? 720 : -720,
              ease: 'power1.inOut',
              transformOrigin: '50% 50%',
              scrollTrigger: {
                trigger: '.home-main',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 3
              }
            }
          );
        });

        const geoDiamonds = document.querySelectorAll('.home-geo-diamond');
        geoDiamonds.forEach((diamond, i) => {
          // Continuous ambient spin
          gsap.to(diamond, {
            rotation: '+=360',
            duration: 15 + i * 5,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%'
          });
          
          // Scroll parallax
          gsap.fromTo(diamond,
            { scale: 0, opacity: 0, y: 100 },
            {
              scale: 1.5, opacity: 0.5, y: -300,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.home-main',
                start: 'top top',
                end: 'bottom top',
                scrub: 2
              }
            }
          );
        });

        gsap.utils.toArray('.formal-card').forEach((card, index) => {
          const speed = (index % 3) + 1; 
          gsap.fromTo(card,
            { y: 150 * speed, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 30%',
                scrub: 1
              }
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="home-main" style={{ overflow: 'hidden', position: 'relative' }}>
      
      <MouseTrail />

      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1000 5000"
      >
        <path 
          className="home-svg-path"
          d="M 100 0 C 400 500, -100 1000, 500 1500 C 1100 2000, 300 2500, 800 3000 C 1300 3500, 200 4000, 500 4500 L 500 5000"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ opacity: 0.25 }}
        />
        <path 
          className="home-svg-path"
          d="M 900 0 C 600 600, 1100 1200, 500 1800 C -100 2400, 700 3000, 200 3600 C -300 4200, 800 4600, 500 5000"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ opacity: 0.15 }}
        />
        <path 
          className="home-svg-path"
          d="M 500 0 Q 200 400, 500 800 Q 800 1200, 500 1600 Q 200 2000, 500 2400 Q 800 2800, 500 3200 Q 200 3600, 500 4000 Q 800 4400, 500 5000"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="0.5"
          strokeLinecap="round"
          style={{ opacity: 0.08 }}
        />

        <circle className="home-geo-circle" cx="150" cy="800" r="80" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" style={{ opacity: 0.2 }} />
        <circle className="home-geo-circle" cx="850" cy="1500" r="120" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" style={{ opacity: 0.15 }} />
        <circle className="home-geo-circle" cx="200" cy="2500" r="60" fill="none" stroke="var(--text-primary)" strokeWidth="0.5" style={{ opacity: 0.12 }} />
        <circle className="home-geo-circle" cx="800" cy="3500" r="100" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" style={{ opacity: 0.18 }} />

        <rect className="home-geo-diamond" x="470" y="1200" width="60" height="60" fill="none" stroke="var(--accent-gold)" strokeWidth="1" style={{ opacity: 0 }} transform="rotate(45 500 1230)" />
        <rect className="home-geo-diamond" x="120" y="2000" width="40" height="40" fill="none" stroke="var(--accent-gold)" strokeWidth="1" style={{ opacity: 0 }} transform="rotate(45 140 2020)" />
        <rect className="home-geo-diamond" x="830" y="3000" width="50" height="50" fill="none" stroke="var(--accent-gold)" strokeWidth="1" style={{ opacity: 0 }} transform="rotate(45 855 3025)" />
      </svg>

      <section 
        ref={heroRef}
        style={{
          position: 'relative',
          height: '140vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          perspective: '1200px'
        }}
      >
        <div 
          ref={textRef}
          style={{
            position: 'absolute',
            zIndex: 1,
            textAlign: 'center',
            width: '100%',
            top: '20%',
            mixBlendMode: 'difference',
            pointerEvents: 'none',
          }}
        >
          <h1 style={{ fontSize: 'clamp(8rem, 25vw, 30rem)', color: 'var(--text-primary)', lineHeight: 0.8, letterSpacing: '-0.02em', margin: 0 }}>
            NOIR
          </h1>
          <h2 style={{ fontSize: 'clamp(3rem, 8vw, 10rem)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, marginTop: '-2rem' }}>
            The Atelier
          </h2>
        </div>

        <div 
          ref={mainModelRef}
          style={{
            position: 'absolute',
            zIndex: 10,
            bottom: '-5%',
            height: '110vh',
            transformOrigin: 'bottom center',
            pointerEvents: 'none'
          }}
        >
          <img 
            src="/herosection-main.png" 
            alt="Main Model" 
            style={{ height: '100%', width: 'auto', display: 'block', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,1))' }} 
          />
        </div>

        {heroImages.slice(0, 5).map((img, i) => (
          <div 
            key={img.id}
            ref={addToLeft}
            style={{
              position: 'absolute',
              top: `${15 + (i * 12)}%`,
              left: `${2 + (i * 5)}%`,
              width: 'clamp(150px, 20vw, 400px)',
              zIndex: i % 2 === 0 ? 2 : 12,
              boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <img src={img.url} alt={img.alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ))}

        {heroImages.slice(5, 10).map((img, i) => (
          <div 
            key={img.id}
            ref={addToRight}
            style={{
              position: 'absolute',
              top: `${10 + (i * 14)}%`,
              right: `${2 + (i * 5)}%`,
              width: 'clamp(180px, 22vw, 450px)',
              zIndex: i % 2 === 0 ? 11 : 3,
              boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <img src={img.url} alt={img.alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ))}
      </section>

      <Marquee text="THE FORMAL ARCHIVE" />

      <section className="formal-section" style={{ position: 'relative', zIndex: 10, padding: '0 var(--page-padding)', margin: '15rem 0 10rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '15rem' }}>
           <h2 style={{ fontSize: 'clamp(4rem, 10vw, 12rem)', fontFamily: 'var(--font-display)', lineHeight: 0.9 }}>
             FORMAL<br/>
             <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--accent-gold)' }}>Showcase</span>
           </h2>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5vw', alignItems: 'center' }}>
          {formalImages.map((img, idx) => {
           
            const isLarge = idx % 4 === 0;
            const isMedium = idx % 4 === 1 || idx % 4 === 2;
            const isSmall = idx % 4 === 3;
            
            const marginTop = idx % 2 === 0 ? '10vw' : '-10vw';
            const width = isLarge ? 'clamp(300px, 40vw, 600px)' : (isMedium ? 'clamp(250px, 30vw, 450px)' : 'clamp(200px, 20vw, 350px)');
            const zIndex = 20 - idx;
            
            return (
              <div 
                key={img.id} 
                className="formal-card"
                style={{ 
                  position: 'relative', 
                  width: width,
                  marginTop: marginTop,
                  zIndex: zIndex,
                  margin: '2vw'
                }}
              >
                <div 
                  className="formal-img-container"
                  style={{ 
                    position: 'relative', 
                    aspectRatio: isLarge ? '3/4' : '4/5', 
                    overflow: 'hidden',
                    borderRadius: '2px',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <img 
                    src={img.url} 
                    alt={img.alt} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), filter 1.5s'
                    }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(2deg)';
                      e.currentTarget.style.filter = 'contrast(1.2) saturate(0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      e.currentTarget.style.filter = 'contrast(1) saturate(1)';
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    top: '2rem', left: '-2rem',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'top left',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    padding: '0.5rem 1rem',
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: '1rem',
                    letterSpacing: '0.1em'
                  }}>
                    Look 0{idx + 1}
                  </div>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.5rem' }}>FW 2026</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
};

export default Home;
