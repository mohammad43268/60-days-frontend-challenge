import React, { createContext, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pathRef = useRef(null);

  const transitionTo = (to) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const path = pathRef.current;
    
    // Path States
    const startPath = "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z";
    const midEnterPath = "M 0 50 Q 50 0 100 50 L 100 100 Q 50 100 0 100 Z";
    const endEnterPath = "M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z";
    const midExitPath = "M 0 0 Q 50 0 100 0 L 100 50 Q 50 0 0 50 Z";
    const endExitPath = "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z";

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        gsap.set(path, { attr: { d: startPath } });
      }
    });

    // Enter animation
    tl.to(path, {
      attr: { d: midEnterPath },
      duration: 0.4,
      ease: 'power2.in'
    })
    .to(path, {
      attr: { d: endEnterPath },
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        navigate(to);
        window.scrollTo(0, 0);
      }
    })
    // Exit animation
    .to(path, {
      attr: { d: midExitPath },
      duration: 0.4,
      ease: 'power2.in'
    })
    .to(path, {
      attr: { d: endExitPath },
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      {children}

      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'flex',
        }}
      >
        <svg 
          style={{ width: '100%', height: '100%' }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path 
            ref={pathRef}
            d="M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z"
            fill="#050505"
          />
        </svg>
      </div>
      
    </TransitionContext.Provider>
  );
};

export const useTransition = () => useContext(TransitionContext);
