import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../App';

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal >= 499 ? 0 : 49;
  const total = cartTotal + shipping;

  if (cart.length === 0) return (
    <div className="page">
      <div className="cart-empty">
        <div className="wishlist-empty">
          <div className="icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p style={{ marginBottom: '1.5rem' }}>Add some plants to get started!</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', display: 'inline-block', borderRadius: '8px' }}>
            🌿 Shop Plants
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>🛒 My Cart ({cart.length} items)</h2>
        <button className="btn-secondary" onClick={clearCart}>Clear Cart</button>
      </div>

      <div className="cart-layout">
        <div>
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <img src={item.image?.startsWith('/') ? item.image : `/images/${item.image}`} alt={item.name}
                onError={e => { e.target.src = 'https://via.placeholder.com/80?text=🌿'; }} />
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <div style={{ color: 'var(--green)', fontWeight: 700 }}>₹{item.price}</div>
              </div>
              <div className="qty-control">
                <button onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
              </div>
              <div style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>₹{item.price * item.quantity}</div>
              <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--red)' }}>✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
          <div className="cart-summary-row"><span>Subtotal ({cart.length} items)</span><span>₹{cartTotal}</span></div>
          <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--green)' }}>FREE</span> : `₹${shipping}`}</span></div>
          {shipping > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Add ₹{499 - cartTotal} more for free shipping</div>}
          <div className="cart-summary-row total"><span>Total</span><span>₹{total}</span></div>
          <button className="btn-block" onClick={() => user ? navigate('/checkout') : navigate('/login')} style={{ marginTop: '1rem' }}>
            {user ? 'Proceed to Checkout →' : 'Login to Checkout'}
          </button>
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--green)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
