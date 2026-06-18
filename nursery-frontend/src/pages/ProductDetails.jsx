import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart, useAuth } from '../App';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('care');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverStar, setHoverStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { user, wishlist, setWishlist } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      const rel = await API.get(`/products/${id}/related`);
      setRelated(rel.data);
    } catch { toast.error('Product not found'); navigate('/'); }
    finally { setLoading(false); }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/reviews/${id}`);
      setReviews(data);
    } catch {}
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart(product, qty);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await API.put(`/wishlist/${id}`);
      setWishlist(data.wishlist);
      toast.success(data.added ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const isWishlisted = wishlist?.some(w => (w._id || w) === id);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!rating) { toast.error('Please select a rating'); return; }
    try {
      setSubmitting(true);
      await API.post(`/reviews/${id}`, { rating, comment });
      toast.success('Review submitted!');
      setRating(0); setComment('');
      fetchReviews(); fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="spinner" style={{ paddingTop: '5rem' }} />;
  if (!product) return null;

  const disc = product.originalPrice && Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="page">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: 'var(--green)', textDecoration: 'none' }}>← Back to Shop</Link>
      </div>

      {/* Main product section */}
      <div className="product-detail">
        <div>
          <img
            src={product.image?.startsWith('/') ? product.image : `/images/${product.image}`}
            alt={product.name}
            onError={e => { e.target.src = 'https://via.placeholder.com/500x400?text=Plant'; }}
          />
        </div>
        <div>
          <span className="category-tag">{product.category}</span>
          <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{product.name}</h1>
          <div className="rating" style={{ fontSize: '1rem', margin: '0.5rem 0' }}>
            {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
            <span style={{ color: '#666', fontSize: '0.9rem' }}>  {product.rating?.toFixed(1) || '0.0'} ({product.numReviews} reviews)</span>
          </div>

          <div className="price-row" style={{ margin: '1rem 0' }}>
            <span className="price" style={{ fontSize: '2rem' }}>₹{product.price}</span>
            {product.originalPrice && <span className="original-price" style={{ fontSize: '1.1rem' }}>₹{product.originalPrice}</span>}
            {disc > 0 && <span className="discount-badge" style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}>{disc}% OFF</span>}
          </div>

          <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>

          {/* Pet & Difficulty */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ background: '#f0f4ff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>
              {product.petFriendly ? '🐾 Pet Friendly' : '⚠️ Not Pet Safe'}
            </span>
            <span style={{ background: '#f0f4ff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>
              🌱 {product.difficulty} Care
            </span>
          </div>

          {/* Stock info */}
          {product.stock === 0 ? (
            <div className="alert alert-error">⚠️ This item is currently out of stock</div>
          ) : product.stock <= 5 ? (
            <div className="alert alert-info">🔥 Only {product.stock} left in stock!</div>
          ) : null}

          {/* Quantity & Cart */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddToCart}>🛒 Add to Cart</button>
              <button className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={toggleWishlist} style={{ fontSize: '1.3rem', padding: '0.5rem 0.8rem' }}>
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>
          )}

          <button className="btn-outline" style={{ width: '100%' }} onClick={() => { handleAddToCart(); navigate('/cart'); }}>
            ⚡ Buy Now
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'care' ? 'active' : ''}`} onClick={() => setActiveTab('care')}>🌿 Plant Care</button>
        <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews ({reviews.length})</button>
      </div>

      {activeTab === 'care' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--green)' }}>🌿 Care Guide</h3>
          <div className="plant-care-grid">
            <div className="care-item">
              <div className="icon">☀️</div>
              <div className="label">Sunlight</div>
              <div className="value">{product.sunlight}</div>
            </div>
            <div className="care-item">
              <div className="icon">💧</div>
              <div className="label">Watering</div>
              <div className="value">{product.watering}</div>
            </div>
            <div className="care-item">
              <div className="icon">🪴</div>
              <div className="label">Soil</div>
              <div className="value">{product.soil}</div>
            </div>
            <div className="care-item">
              <div className="icon">{product.difficulty === 'Easy' ? '😊' : product.difficulty === 'Medium' ? '🤔' : '😤'}</div>
              <div className="label">Difficulty</div>
              <div className="value">{product.difficulty}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--green)' }}>Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--gray)' }}>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="review-card">
                <div className="review-header">
                  <strong>{r.userName || r.user?.name || 'User'}</strong>
                  <span className="star-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>{r.comment}</p>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.3rem' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))
          )}

          {user && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1rem' }}>
                Note: You can only review products you have purchased and received.
              </p>
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray)' }}>Your Rating</label>
                  <div className="stars-input">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={s <= (hoverStar || rating) ? 'active' : ''}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverStar(s)}
                        onMouseLeave={() => setHoverStar(0)}>★</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                    style={{ width: '100%', padding: '0.7rem', border: '2px solid #e5e5e5', borderRadius: '8px', resize: 'vertical', outline: 'none' }}
                    placeholder="Share your experience with this plant..." required />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-grid">
            {related.map(p => (
              <div key={p._id} className="product-card">
                <Link to={`/product/${p._id}`}>
                  <img src={p.image?.startsWith('/') ? p.image : `/images/${p.image}`} alt={p.name}
                    onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=Plant'; }} />
                </Link>
                <div className="product-card-body">
                  <h3>{p.name}</h3>
                  <div className="price">₹{p.price}</div>
                  <Link to={`/product/${p._id}`} className="btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', textDecoration: 'none' }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
