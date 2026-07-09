import React, { useEffect } from 'react';
import gsap from 'gsap';

const Lightbox = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return;

    document.body.classList.add('no-scroll');

    gsap.fromTo('.lightbox-overlay', 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo('.lightbox-img', 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)', delay: 0.1 }
    );

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div 
      className="lightbox-overlay"
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'var(--overlay)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out'
      }}
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          color: '#fff',
          fontSize: '2rem',
          zIndex: 2001
        }}
        aria-label="Close Lightbox"
      >
        &times;
      </button>
      <img 
        src={image.url} 
        alt={image.alt} 
        className="lightbox-img"
        style={{
          maxHeight: '90vh',
          maxWidth: '90vw',
          objectFit: 'contain',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Lightbox;
