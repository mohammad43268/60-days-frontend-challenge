import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { IndianRupee, TrendingDown, Clock, Package } from 'lucide-react';
import './Dashboard.css';

const StatCard = ({ title, value, prefix = '', suffix = '', icon: Icon, isLoss = false, className = '' }) => {
  const valueRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // GSAP count up animation
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayValue(obj.val);
      }
    });
  }, [value]);

  return (
    <div className={`stat-card card ${className}`}>
      <div className="stat-header">
        <h3>{title}</h3>
        <div className={`stat-icon ${isLoss ? 'icon-loss' : 'icon-primary'}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className={`stat-value ${isLoss ? 'text-loss' : ''}`}>
        {prefix}{displayValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}{suffix}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const dashboardRef = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stat-card', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
      
      gsap.fromTo('.activity-item',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.4, ease: 'power2.out' }
      );
    }, dashboardRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className="admin-dashboard" ref={dashboardRef}>
      <header className="admin-header">
        <h1>Dashboard Overview</h1>
        <p>Operations summary for Verdant & Co.</p>
      </header>

      <div className="stats-grid">
        <StatCard title="Total Sales" value={2450500} prefix="₹" icon={IndianRupee} />
        <StatCard title="Net Loss" value={124000} prefix="₹" icon={TrendingDown} isLoss={true} className="loss-card" />
        <StatCard title="Pending Tokens" value={14} icon={Clock} />
        <StatCard title="Active Orders" value={56} icon={Package} />
      </div>

      <div className="dashboard-content">
        <div className="recent-activity card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot dot-sage"></div>
              <div className="activity-details">
                <p>Order <strong>#ORD-7294</strong> fulfilled</p>
                <span>2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot dot-maroon"></div>
              <div className="activity-details">
                <p>Refund issued for <strong>#ORD-7102</strong></p>
                <span>5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot dot-sage"></div>
              <div className="activity-details">
                <p>New order <strong>#ORD-8102</strong> received</p>
                <span>Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
