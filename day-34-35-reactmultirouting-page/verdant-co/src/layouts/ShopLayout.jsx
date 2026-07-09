import React, { useRef, useLayoutEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';
import { ShoppingBag } from 'lucide-react';
import './ShopLayout.css';

const ShopLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const mainRef = useRef();

  useLayoutEffect(() => {
    // GSAP page transition on route change to simulate seamless barba.js
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }, mainRef);
    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="shop-layout">
      <header className="shop-header glass-panel">
        <div className="container header-container">
          <Link to="/shop" className="logo">
            Verdant & Co.
          </Link>
          <nav className="shop-nav">
            <Link to="/shop">Shop</Link>
            <Link to="/shop/orders">My Orders</Link>
            <Link to="/shop/cart" className="cart-link">
              <ShoppingBag size={20} />
            </Link>
            <button onClick={logout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <main className="shop-main" ref={mainRef}>
        <Outlet />
      </main>

      <footer className="shop-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Verdant & Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;
