import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { images } from '../data/images';
import { collections } from '../data/collections';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const bioRef = useRef(null);
  const bioTriggerRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion && bioRef.current) {
        
        ScrollTrigger.create({
          trigger: bioTriggerRef.current,
          start: "top 70%",
          onEnter: () => {
            gsap.to('.bio-letter', {
              y: 0,
              opacity: 1,
              ease: "expo.out",
              duration: 1.2,
              stagger: 0.02
            });
          },
          once: true
        });
      }

      if (!prefersReducedMotion) {
       
        if (pathRef.current) {
          const pathLength = pathRef.current.getTotalLength();
          gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

          gsap.to(pathRef.current, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-main-container",
              start: "top top",
              end: "bottom bottom",
              scrub: 1
            }
          });
        }

        const aboutPaths = document.querySelectorAll('.about-svg-path-secondary');
        aboutPaths.forEach((path, i) => {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, y: 150 });
          gsap.to(path, {
            strokeDashoffset: 0,
            y: -250,
            ease: 'none',
            scrollTrigger: {
              trigger: '.about-main-container',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 2.5 + (i * 0.8)
            }
          });
        });

        const aboutCircles = document.querySelectorAll('.about-geo-ring');
        aboutCircles.forEach((circle, i) => {
          gsap.fromTo(circle,
            { y: 100, scale: 0.8, opacity: 0 },
            {
              y: -300,
              scale: i % 2 === 0 ? 1.3 : 0.9,
              opacity: 0.25,
              rotation: i % 2 === 0 ? 720 : -720,
              ease: 'power1.inOut',
              transformOrigin: '50% 50%',
              scrollTrigger: {
                trigger: '.about-main-container',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 3
              }
            }
          );
        });

        const aboutCrosses = document.querySelectorAll('.about-geo-cross');
        aboutCrosses.forEach((cross, i) => {
          gsap.to(cross, {
            rotation: '+=360',
            duration: 10 + i * 2,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%'
          });

          gsap.fromTo(cross,
            { scale: 0, opacity: 0, y: 50 },
            {
              scale: 1.2, opacity: 0.4, y: -200,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.about-main-container',
                start: `${20 + i * 25}% top`,
                end: `${50 + i * 25}% top`,
                scrub: 2
              }
            }
          );
        });

        gsap.utils.toArray('.about-img-container').forEach(container => {
          const img = container.querySelector('img');

          gsap.fromTo(container, 
            { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
            {
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
              duration: 1.5,
              ease: 'power4.inOut',
              scrollTrigger: {
                trigger: container,
                start: 'top 85%',
              }
            }
          );

          gsap.fromTo(img, 
            { scale: 1.3, y: -50 },
            {
              scale: 1,
              y: 50,
              ease: 'none',
              scrollTrigger: {
                trigger: container,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        });


        gsap.fromTo('.timeline-item',
          { opacity: 0, x: -100 },
          {
            opacity: 1, x: 0, duration: 1.5, stagger: 0.2, ease: 'power4.out',
            scrollTrigger: {
              trigger: '.timeline-container',
              start: 'top 75%'
            }
          }
        );
      }

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    });

      return () => {
        ctx.revert();
      };
  }, []);

  return (
    <main className="about-main-container" style={{ position: 'relative', paddingTop: 'calc(var(--nav-height) + 6rem)', paddingBottom: '4rem', overflow: 'hidden' }}>

      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '100vw',
          height: '100%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1000 3000"
      >
        <path 
          ref={pathRef}
          d="M 500 0 C 800 500, 200 1000, 500 1500 C 800 2000, 200 2500, 500 3000"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />
        <path 
          className="about-svg-path-secondary"
          d="M 200 0 C 400 300, 800 600, 600 1000 C 400 1400, 100 1800, 300 2200 C 500 2600, 700 2800, 500 3000"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="1"
          strokeLinecap="round"
          style={{ opacity: 0.12 }}
        />
        <path 
          className="about-svg-path-secondary"
          d="M 800 0 C 600 400, 200 700, 400 1100 C 600 1500, 900 1900, 700 2300 C 500 2700, 300 2900, 500 3000"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="0.5"
          strokeLinecap="round"
          style={{ opacity: 0.06 }}
        />

        <g className="about-geo-ring">
          <circle cx="150" cy="600" r="80" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" style={{ opacity: 0.2 }} />
          <circle cx="150" cy="600" r="60" fill="none" stroke="var(--accent-gold)" strokeWidth="0.3" style={{ opacity: 0.15 }} />
          <circle cx="150" cy="600" r="40" fill="none" stroke="var(--accent-gold)" strokeWidth="0.3" style={{ opacity: 0.1 }} />
        </g>
        <g className="about-geo-ring">
          <circle cx="850" cy="1800" r="100" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" style={{ opacity: 0.18 }} />
          <circle cx="850" cy="1800" r="70" fill="none" stroke="var(--accent-gold)" strokeWidth="0.3" style={{ opacity: 0.12 }} />
          <circle cx="850" cy="1800" r="40" fill="none" stroke="var(--accent-gold)" strokeWidth="0.3" style={{ opacity: 0.08 }} />
        </g>

        <g className="about-geo-cross" style={{ opacity: 0.15 }}>
          <line x1="480" y1="1100" x2="520" y2="1100" stroke="var(--accent-gold)" strokeWidth="1" />
          <line x1="500" y1="1080" x2="500" y2="1120" stroke="var(--accent-gold)" strokeWidth="1" />
        </g>
        <g className="about-geo-cross" style={{ opacity: 0.15 }}>
          <line x1="180" y1="2200" x2="220" y2="2200" stroke="var(--accent-gold)" strokeWidth="1" />
          <line x1="200" y1="2180" x2="200" y2="2220" stroke="var(--accent-gold)" strokeWidth="1" />
        </g>
        <g className="about-geo-cross" style={{ opacity: 0.15 }}>
          <line x1="780" y1="2700" x2="820" y2="2700" stroke="var(--accent-gold)" strokeWidth="1" />
          <line x1="800" y1="2680" x2="800" y2="2720" stroke="var(--accent-gold)" strokeWidth="1" />
        </g>
      </svg>

      <section ref={bioTriggerRef} style={{ position: 'relative', zIndex: 10, padding: '0 var(--page-padding)', marginBottom: '15rem', maxWidth: '1400px', margin: '0 auto 15rem' }}>
        <h1 style={{ fontSize: 'clamp(4rem, 12vw, 12rem)', marginBottom: '4rem', fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center' }}>
          THE ATELIER
        </h1>
        <p ref={bioRef} style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.3, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, textAlign: 'center', margin: '0 auto', maxWidth: '1100px' }}>
          {"Founded in the shadows of modern expression, NOIR ATELIER exists at the intersection of cinematic drama and wearable architecture. Every silhouette is a study in negative space.".split('').map((char, index) => {
            if (char === ' ') return ' ';
            return (
              <span 
                key={index} 
                className="bio-letter" 
                style={{ display: 'inline-block', opacity: 0, transform: 'translateY(40px)' }}
              >
                {char}
              </span>
            );
          })}
        </p>
      </section>

      <section style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20rem', marginBottom: '15rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8rem', padding: '0 var(--page-padding)' }}>
          <div className="about-img-container" style={{ flex: '1 1 500px', overflow: 'hidden', height: '90vh' }}>
            <img src={images[7].url} alt={images[7].alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
          </div>
          <div style={{ flex: '1 1 400px', paddingRight: '5vw' }}>
            <h2 style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '2rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>Material<br/>Mastery</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>We source the darkest, most light-absorbent fabrics to create depth without color. Texture becomes the primary communicator of emotion, catching light only to immediately devour it.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '8rem', padding: '0 var(--page-padding)' }}>
          <div style={{ flex: '1 1 400px', textAlign: 'right', paddingLeft: '5vw' }}>
            <h2 style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '2rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>Sculptural<br/>Form</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>The body is merely a canvas. Our pieces reshape the human form, elongating lines and exaggerating shoulders to command space and presence. A walk becomes an event.</p>
          </div>
          <div className="about-img-container" style={{ flex: '1 1 500px', overflow: 'hidden', height: '90vh' }}>
            
            <img src={images.length > 12 ? images[12].url : images[0].url} alt="Sculptural Form" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 10, padding: '0 var(--page-padding)' }}>
        <h2 style={{ fontSize: 'clamp(4rem, 10vw, 10rem)', marginBottom: '8rem', textAlign: 'center', fontFamily: 'var(--font-display)' }}>EVOLUTION</h2>
        <div className="timeline-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6rem' }}>
          {collections.map((col) => (
            <div 
              key={col.id} 
              className="timeline-item" 
              style={{ 
                display: 'flex', 
                gap: '4rem', 
                borderBottom: '1px solid rgba(255,255,255,0.1)', 
                paddingBottom: '4rem',
                transition: 'border-color 0.4s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
                const title = e.currentTarget.querySelector('h3');
                if(title) title.style.color = 'var(--accent-gold)';
                if(title) title.style.transform = 'translateX(20px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                const title = e.currentTarget.querySelector('h3');
                if(title) title.style.color = 'var(--text-primary)';
                if(title) title.style.transform = 'translateX(0px)';
              }}
            >
              <div style={{ flexShrink: 0, width: '150px', fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--text-muted)' }}>
                {col.year}
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '3rem', 
                  textTransform: 'uppercase', 
                  marginBottom: '1.5rem', 
                  fontFamily: 'var(--font-display)',
                  transition: 'color 0.4s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {col.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.4rem', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>{col.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
};

export default About;
