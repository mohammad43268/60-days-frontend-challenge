import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import { useLenis } from './hooks/useLenis';
import { TransitionProvider } from './context/TransitionContext';

import ScrollTrigger from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const isFirstMount = useRef(true);

  const lenis = useLenis();
  const location = useLocation();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, lenis]);

  return (
    <TransitionProvider>
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}

      <CustomCursor />
      <Navbar />
      
      <Outlet />

      <Footer />
    </TransitionProvider>
  );
}

export default App;

