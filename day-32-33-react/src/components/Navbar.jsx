import React from 'react';
import { useTransition } from '../context/TransitionContext';
import Magnetic from './Magnetic';

const Navbar = () => {
  const { transitionTo } = useTransition();

  const handleLinkClick = (e, to) => {
    e.preventDefault();
    if (window.location.pathname !== to) {
      transitionTo(to);
    }
  };

  const navLinks = [
    { name: 'Collections', path: '/collections' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 var(--page-padding)',
        height: 'var(--nav-height)',
        zIndex: 1000,
        mixBlendMode: 'difference'
      }}
    >
      <Magnetic>
        <a 
          href="/" 
          onClick={(e) => handleLinkClick(e, '/')}
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '2rem', 
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'inline-block',
            color: '#fff'
          }}
        >
          NOIR
        </a>
      </Magnetic>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
        {navLinks.map((link) => (
          <Magnetic key={link.name}>
            <a 
              href={link.path}
              className="nav-link-hover"
              onClick={(e) => handleLinkClick(e, link.path)}
              style={{ 
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                color: '#fff',
                textTransform: 'lowercase',
                display: 'inline-block',
                padding: '0.5rem',
              }}
            >
              {link.name}
            </a>
          </Magnetic>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
