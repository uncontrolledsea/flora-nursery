import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="page">
      <div className="success-box">
        <div className="check">🎉</div>
        <h2>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--gray)', margin: '0.5rem 0 1.5rem' }}>
          Your plants are on their way. We'll keep you updated!
        </p>
        <div style={{ background: 'var(--green-pale)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Order ID: <strong>{id}</strong>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', display: 'inline-block' }}>
            Track Order
          </Link>
          <Link to="/" className="btn-outline" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', display: 'inline-block' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
