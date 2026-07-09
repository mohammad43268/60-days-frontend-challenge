import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../../data/products';
import { ArrowLeft } from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div className="not-found">Product not found.</div>;
  }

  const handleAddToCart = () => {
    // Navigate to cart for demo purposes
    navigate('/shop/cart');
  };

  return (
    <div className="product-detail">
      <button className="back-btn" onClick={() => navigate('/shop')}>
        <ArrowLeft size={20} />
        Back to Shop
      </button>

      <div className="detail-grid">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="detail-info">
          <span className="category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="price">${product.price.toFixed(2)}</p>
          
          <div className="description">
            <p>{product.description}</p>
          </div>
          
          <button className="btn-primary add-to-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          
          <div className="details-accordion">
            <div className="accordion-item">
              <h4>Shipping & Returns</h4>
              <p>Free shipping on orders over $150. Returns accepted within 30 days.</p>
            </div>
            <div className="accordion-item">
              <h4>Care Instructions</h4>
              <p>Hand wash recommended for ceramics. Dry clean textiles for best results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
