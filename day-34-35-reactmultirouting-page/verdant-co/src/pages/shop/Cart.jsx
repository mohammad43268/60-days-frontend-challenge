import React, { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Trash2, ArrowLeft } from 'lucide-react';
import { products } from '../../data/products';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const cartRef = useRef();
  
  // Mock cart data
  const cartItems = [
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 2 }
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Slide in animation for the cart page
      gsap.fromTo(cartRef.current, 
        { x: '100%', opacity: 0 }, 
        { x: '0%', opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
      
      // Stagger items
      gsap.fromTo('.cart-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
      );
    }, cartRef);
    
    return () => ctx.revert();
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-page" ref={cartRef}>
      <button className="back-btn" onClick={() => navigate('/shop')}>
        <ArrowLeft size={20} />
        Continue Shopping
      </button>
      
      <div className="cart-container">
        <div className="cart-items-section">
          <h2>Your Cart</h2>
          
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div className="cart-item" key={item.id + index}>
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button>-</button>
                    <span>{item.quantity}</span>
                    <button>+</button>
                  </div>
                  <button className="remove-btn">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cart-summary-section">
          <div className="summary-card card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="btn-primary checkout-btn">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
