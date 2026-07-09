import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'General',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const pathRef = useRef(null);
  const checkmarkRef = useRef(null);
  const formRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1500);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".contact-main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
          }
        });
      }

      if (formRef.current) {
        gsap.fromTo(formRef.current, 
          { opacity: 0, y: 100 }, 
          { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out', delay: 0.5 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isSuccess && checkmarkRef.current) {
      gsap.fromTo(checkmarkRef.current, 
        { strokeDasharray: 100, strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 1, ease: 'power2.out' }
      );
    }
  }, [isSuccess]);

  const inputStyle = {
    width: '100%',
    padding: '1.5rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '1.5rem',
    outline: 'none',
    transition: 'border-color 0.4s'
  };

  const labelStyle = {
    display: 'block',
    marginTop: '3rem',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)'
  };

  return (
    <main className="contact-main" style={{ position: 'relative', paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh', paddingBottom: '10rem', overflow: 'hidden' }}>

      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
        preserveAspectRatio="none"
        viewBox="0 0 1000 1000"
      >
        <path 
          ref={pathRef}
          className="contact-svg-path"
          d="M 100 0 C 100 500, 800 300, 800 1000"
          fill="none"
          stroke="var(--accent-gold)"
          strokeWidth="2"
          style={{ opacity: 0.4 }}
        />
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '5rem', padding: '0 var(--page-padding)', position: 'relative', zIndex: 10 }}>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 'clamp(5rem, 12vw, 15rem)', fontFamily: 'var(--font-display)', lineHeight: 0.8, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
            GET<br/>IN<br/><span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--accent-gold)' }}>TOUCH</span>
          </h1>
          <div style={{ marginTop: '5rem' }}>
            <p style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Headquarters</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '2rem', lineHeight: 1.4 }}>
              14 Avenue Montaigne<br/>
              75008 Paris, France
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginTop: '2rem', textDecoration: 'underline' }}>
              inquiries@noiratelier.com
            </p>
          </div>
        </div>

        <div ref={formRef} style={{ display: 'flex', alignItems: 'center' }}>
          {isSuccess ? (
            <div style={{ width: '100%', textAlign: 'center', padding: '5rem 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ margin: '0 auto 2rem' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.3" />
                <path ref={checkmarkRef} d="M 30 50 L 45 65 L 70 35" fill="none" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginBottom: '1rem' }}>Received</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>The Atelier will be in contact soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: '600px', marginLeft: 'auto' }}>
              
              <div style={{ display: 'flex', gap: '3rem', marginBottom: '2rem' }}>
                {['General', 'Press', 'Booking'].map(type => (
                  <label key={type} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    <input 
                      type="radio" 
                      name="inquiryType" 
                      value={type} 
                      checked={formData.inquiryType === type} 
                      onChange={handleChange} 
                      style={{ accentColor: 'var(--accent-gold)', transform: 'scale(1.2)' }}
                    />
                    {type}
                  </label>
                ))}
              </div>

              <div>
                <label style={labelStyle} htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  style={{...inputStyle, borderBottomColor: errors.name ? '#ff6b6b' : 'rgba(255,255,255,0.2)'}}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--text-primary)'}
                  onBlur={(e) => !errors.name && (e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)')}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  style={{...inputStyle, borderBottomColor: errors.email ? '#ff6b6b' : 'rgba(255,255,255,0.2)'}}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--text-primary)'}
                  onBlur={(e) => !errors.email && (e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)')}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="4"
                  value={formData.message} 
                  onChange={handleChange} 
                  style={{...inputStyle, borderBottomColor: errors.message ? '#ff6b6b' : 'rgba(255,255,255,0.2)', resize: 'vertical'}}
                  onFocus={(e) => e.target.style.borderBottomColor = 'var(--text-primary)'}
                  onBlur={(e) => !errors.message && (e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)')}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  marginTop: '5rem',
                  width: '100%',
                  padding: '2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontSize: '1.2rem',
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'color 0.4s'
                }}
                onMouseEnter={(e) => {
                  if(!isSubmitting) {
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  }
                }}
                onMouseLeave={(e) => {
                  if(!isSubmitting) {
                    e.currentTarget.style.color = 'var(--accent-gold)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {isSubmitting ? 'Transmitting...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
};

export default Contact;
