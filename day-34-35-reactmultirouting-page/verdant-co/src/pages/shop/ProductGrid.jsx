import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { products } from '../../data/products';
import { ShoppingCart, CreditCard } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ProductGrid.css';

gsap.registerPlugin(ScrollTrigger);

const ProductGrid = () => {
  const [quote, setQuote] = useState({ text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" });
  const gridRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch a random quote
    fetch('https://dummyjson.com/quotes/random')
      .then(res => res.json())
      .then(data => {
        if (data && data.quote) {
          setQuote({ text: data.quote, author: data.author });
        }
      })
      .catch(err => console.error("Failed to fetch quote", err));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered fade in on scroll for bento items
      gsap.utils.toArray('.bento-item').forEach((item, i) => {
        gsap.fromTo(item, 
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=100px",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  const handleBuyNow = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    // Simulate buy now - add to cart and go to checkout
    navigate('/shop/cart');
  };

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    // Simulate add to cart toast/animation
    const btn = e.currentTarget;
    gsap.to(btn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
    // In a real app, update CartContext here
  };

  return (
    <div className="product-page">
      <header className="page-header glass-header">
        <h1>The Curated Bento</h1>
        <p>A fluid collection of our most cherished pieces.</p>
      </header>

      <div className="bento-grid container" ref={gridRef}>
        
        {/* Render Products with a Quote inserted at index 4 */}
        {products.map((product, index) => {
          
          // Determine bento span classes based on index to create a masonry/bento look
          let spanClass = "bento-span-1";
          if (index === 0 || index === 7 || index === 11) spanClass = "bento-span-2-tall";
          if (index === 3 || index === 14) spanClass = "bento-span-2-wide";

          return (
            <React.Fragment key={product.id}>
              {index === 4 && (
                <div className="bento-item bento-quote glass-panel">
                  <blockquote>
                    "{quote.text}"
                  </blockquote>
                  <cite>— {quote.author}</cite>
                </div>
              )}
              
              <Link to={`/shop/product/${product.id}`} className={`bento-item ${spanClass} product-bento-card`}>
                <div className="bento-image-wrapper">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  
                  {/* Glassmorphism Action Overlay */}
                  <div className="bento-actions glass-panel">
                    <button className="btn-primary action-btn" onClick={(e) => handleBuyNow(e, product.id)}>
                      <CreditCard size={18} /> Buy
                    </button>
                    <button className="btn-secondary action-btn" onClick={(e) => handleAddToCart(e, product.id)}>
                      <ShoppingCart size={18} /> Add
                    </button>
                  </div>
                </div>
                
                <div className="bento-info glass-panel">
                  <h3>{product.name}</h3>
                  <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
