import React, { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { users } from '../data/users';
import gsap from 'gsap';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Default for demo
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  
  const { login, confirmFirstLogin } = useAuth();
  const navigate = useNavigate();
  
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Handle GSAP animation for modal
  useLayoutEffect(() => {
    if (showAdminModal) {
      const ctx = gsap.context(() => {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
        );
      });
      return () => ctx.revert();
    }
  }, [showAdminModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Mock authentication
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.role === 'admin' && user.isFirstLogin) {
        setPendingUser(user);
        setShowAdminModal(true);
      } else {
        // Direct login
        login(user);
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/shop');
      }
    } else {
      setError('Invalid credentials');
    }
  };

  const handleAdminConfirm = () => {
    login(pendingUser);
    confirmFirstLogin(); // Updates isFirstLogin to false
    navigate('/admin/dashboard');
  };

  const handleAdminReject = () => {
    // If they say they are a customer, we could mock changing their role or just redirect
    // For now, let's just log them in as customer for the demo, or deny
    const demotedUser = { ...pendingUser, role: 'customer' };
    login(demotedUser);
    confirmFirstLogin();
    navigate('/shop');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Verdant & Co.</h1>
        <p className="login-subtitle">Enter your credentials to continue.</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@verdant.co"
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary login-btn">Sign In</button>
        </form>
        
        <div className="demo-credentials">
          <p>Demo Accounts:</p>
          <ul>
            <li><span onClick={() => setEmail('admin@verdant.co')}>admin@verdant.co</span> (Admin)</li>
            <li><span onClick={() => setEmail('customer@example.com')}>customer@example.com</span> (Customer)</li>
          </ul>
        </div>
      </div>

      {showAdminModal && (
        <div className="modal-overlay" ref={overlayRef}>
          <div className="admin-modal" ref={modalRef}>
            <h2>Admin Privileges Detected</h2>
            <p>This account has administrator privileges. Would you like to continue as an Administrator?</p>
            <div className="modal-actions">
              <button onClick={handleAdminReject} className="btn-secondary">No, I'm a customer</button>
              <button onClick={handleAdminConfirm} className="btn-primary">Yes, continue as Admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
