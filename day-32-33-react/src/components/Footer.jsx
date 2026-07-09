import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Magnetic from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const titleRef = useRef(null);
  const wavePathRef = useRef(null);
  const geoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!titleRef.current) return;

      gsap.fromTo(titleRef.current,
        { yPercent: 30, opacity: 0 },
        {
          yPercent: 0, opacity: 1,
          duration: 1.5,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%'
          }
        }
      );

      if (wavePathRef.current) {
        const pathLength = wavePathRef.current.getTotalLength();
        gsap.set(wavePathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.to(wavePathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1
          }
        });
      }

      if (geoRef.current) {
        gsap.to(geoRef.current, {
          rotation: 360,
          ease: 'none',
          transformOrigin: '50% 50%',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 2
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const socialLinks = [
    { name: 'Instagram', href: '#' },
    { name: 'Twitter / X', href: '#' },
    { name: 'Pinterest', href: '#' },
    { name: 'LinkedIn', href: '#' }
  ];

  return (
    <footer 
      ref={footerRef}
      style={{
        position: 'relative',
        padding: '10rem var(--page-padding) 4rem',
        backgroundColor: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden'
      }}
    >
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1200 400"
      >
        <path 
          ref={wavePathRef}
          className="footer-svg-path"
          d="M 0 200 Q 150 50, 300 200 Q 450 350, 600 200 Q 750 50, 900 200 Q 1050 350, 1200 200"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="1"
          style={{ opacity: 0.15 }}
        />
        <g ref={geoRef}>
          <rect x="1050" y="50" width="80" height="80" fill="none" stroke="var(--accent-gold)" strokeWidth="0.5" style={{ opacity: 0.15 }} transform="rotate(45 1090 90)" />
          <rect x="1060" y="60" width="60" height="60" fill="none" stroke="var(--accent-gold)" strokeWidth="0.3" style={{ opacity: 0.1 }} transform="rotate(45 1090 90)" />
        </g>
      </svg>
      <div 
        ref={titleRef}
        style={{ marginBottom: '8rem' }}
      >
        <h2 style={{
          fontSize: 'clamp(5rem, 15vw, 18rem)',
          fontFamily: 'var(--font-display)',
          lineHeight: 0.85,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)'
        }}>
          NOIR<br/>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontStyle: 'italic', 
            fontWeight: 300,
            color: 'var(--accent-gold)'
          }}>
            Atelier
          </span>
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '4rem',
        paddingBottom: '6rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div>
          <p style={{ 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem' 
          }}>
            Location
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.3rem', lineHeight: 1.5 }}>
            14 Avenue Montaigne<br/>
            75008 Paris, France
          </p>
        </div>

        <div>
          <p style={{ 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem' 
          }}>
            Contact
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.3rem', lineHeight: 1.5 }}>
            inquiries@noiratelier.com<br/>
            +33 1 47 23 54 00
          </p>
        </div>

        <div>
          <p style={{ 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem' 
          }}>
            Social
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {socialLinks.map((link) => (
              <Magnetic key={link.name}>
                <a 
                  href={link.href} 
                  style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontStyle: 'italic', 
                    fontSize: '1.3rem',
                    display: 'inline-block',
                    transition: 'color 0.3s',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-gold)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                >
                  {link.name}
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingTop: '3rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          &copy; {new Date().getFullYear()} NOIR ATELIER
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
