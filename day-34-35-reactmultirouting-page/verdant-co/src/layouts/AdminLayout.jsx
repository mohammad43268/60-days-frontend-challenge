import React, { useRef, useLayoutEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';
import { LayoutDashboard, ShoppingCart, AlertCircle, LogOut } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const outletRef = useRef();

  useLayoutEffect(() => {
    // GSAP page transition on route change
    const ctx = gsap.context(() => {
      gsap.fromTo(
        outletRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }, outletRef);
    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Verdant Ops</h2>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => isActive ? 'active' : ''}>
            <ShoppingCart size={20} />
            Orders
          </NavLink>
          <NavLink to="/admin/losses" className={({isActive}) => isActive ? 'active' : ''}>
            <AlertCircle size={20} />
            Loss Report
          </NavLink>
        </nav>

        <div className="admin-footer">
          <div className="admin-user">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={logout} className="admin-logout">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content" ref={outletRef}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
