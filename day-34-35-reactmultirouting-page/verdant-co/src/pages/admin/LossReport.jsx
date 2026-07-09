import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { AlertOctagon, TrendingDown } from 'lucide-react';
import './LossReport.css';

const LossReport = () => {
  const [lossAmount, setLossAmount] = useState(0);
  const targetLoss = 124000;
  
  const reportRef = useRef();

  useEffect(() => {
    // GSAP count up animation for loss
    const obj = { val: 0 };
    gsap.to(obj, {
      val: targetLoss,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        setLossAmount(obj.val);
      }
    });
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.loss-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
      );
    }, reportRef);
    
    return () => ctx.revert();
  }, []);

  const losses = [
    { id: 'L-101', product: 'Ceramic Vase (Damaged in Transit)', amount: 8500.00, date: '2023-11-01' },
    { id: 'L-102', product: 'Woven Runner (Lost by Courier)', amount: 6800.00, date: '2023-10-28' },
    { id: 'L-103', product: 'Terracotta Planter (Defective Glaze)', amount: 4500.00, date: '2023-10-25' }
  ];

  return (
    <div className="loss-report" ref={reportRef}>
      <header className="admin-header">
        <h1>Loss Report</h1>
        <p>Breakdown of operational losses, damages, and refunds.</p>
      </header>
      
      <div className="loss-overview card">
        <div className="loss-icon">
          <AlertOctagon size={32} />
        </div>
        <div className="loss-info">
          <h2>Total Net Loss (30 Days)</h2>
          <div className="loss-amount">₹{lossAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>
      </div>
      
      <div className="loss-breakdown card">
        <h3>Recent Losses</h3>
        <div className="loss-list">
          {losses.map(loss => (
            <div className="loss-item" key={loss.id}>
              <div className="loss-item-icon">
                <TrendingDown size={18} />
              </div>
              <div className="loss-item-details">
                <h4>{loss.product}</h4>
                <div className="loss-meta">
                  <span>ID: {loss.id}</span>
                  <span>{loss.date}</span>
                </div>
              </div>
              <div className="loss-item-amount">
                -₹{loss.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LossReport;
