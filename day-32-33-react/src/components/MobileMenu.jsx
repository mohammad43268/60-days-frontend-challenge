import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import { useTransition } from '../context/TransitionContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  const { transitionTo } = useTransition();

  useEffect(() => {
    if (isOpen) {
      gsap.to(menuRef.current, {
        clipPath: 'circle(150% at 100% 0%)',
        duration: 0.8,
        ease: 'power3.inOut',
      });
      document.body.classList.add('no-scroll');
    } else {
      gsap.to(menuRef.current, {
        clipPath: 'circle(0% at 100% 0%)',
        duration: 0.8,
        ease: 'power3.inOut',
      });
      document.body.classList.remove('no-scroll');
    }
  }, [isOpen]);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    onClose();
   
    setTimeout(() => {
      transitionTo(path);
    }, 800);
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        zIndex: 900,
        clipPath: 'circle(0% at 100% 0%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <nav>
        <ul style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {[
            { name: 'Home', path: '/' },
            { name: 'Collections', path: '/collections' },
            { name: 'Gallery', path: '/gallery' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' },
          ].map((link, i) => (
            <li key={i}>
              <a
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.05em',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--accent-gold)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-primary)';
                }}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MobileMenu;
