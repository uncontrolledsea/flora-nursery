import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useCart, useAuth } from '../App';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { setWishlist } = useAuth();

  useEffect(() => {
    API.get('/wishlist').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    try {
      const { data } = await API.put(`/wishlist/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      setWishlist(data.wishlist);
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const moveToCart = (product) => {
    addToCart(product);
    remove(product._id);
    toast.success(`${product.name} moved to cart! 🛒`);
  };

  if (loading) return <div className="spinner" style={{ paddingTop: '4rem' }} />;

  if (items.length === 0) return (
    <div className="page">
      <div className="wishlist-empty">
        <div className="icon">🤍</div>
        <h2>Your wishlist is empty</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--gray)' }}>Save plants you love for later!</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', display: 'inline-block', borderRadius: '8px' }}>
          🌿 Browse Plants
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1.5rem' }}>❤️ My Wishlist ({items.length})</h2>
      <div className="products-grid">
        {items.map(product => (
          <div key={product._id} className="product-card">
            <Link to={`/product/${product._id}`}>
              <img src={product.image?.startsWith('/') ? product.image : `/images/${product.image}`} alt={product.name}
                onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=Plant'; }} />
            </Link>
            <div className="product-card-body">
              <span className="category-tag">{product.category}</span>
              <h3>{product.name}</h3>
              <div className="price">₹{product.price}</div>
              <div className="card-actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <button className="btn-primary" onClick={() => moveToCart(product)}>🛒 Move to Cart</button>
                <button className="btn-outline" onClick={() => remove(product._id)} style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
