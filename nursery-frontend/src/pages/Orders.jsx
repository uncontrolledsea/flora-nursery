import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CLASS = {
  'Placed': 'status-placed', 'Confirmed': 'status-confirmed', 'Packed': 'status-packed',
  'Shipped': 'status-shipped', 'Out for Delivery': 'status-out', 'Delivered': 'status-delivered', 'Cancelled': 'status-cancelled'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ paddingTop: '4rem' }} />;

  if (orders.length === 0) return (
    <div className="page">
      <div className="empty-state">
        <div className="icon">📦</div>
        <h2>No Orders Yet</h2>
        <p style={{ marginBottom: '1.5rem' }}>Start shopping and your orders will appear here!</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', display: 'inline-block', borderRadius: '8px' }}>Shop Now</Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <h2 style={{ marginBottom: '1.5rem' }}>📦 My Orders</h2>
      {orders.map(order => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Order ID</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order._id.slice(-8).toUpperCase()}</div>
            </div>
            <span className={`order-status-badge ${STATUS_CLASS[order.status] || ''}`}>{order.status}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>₹{order.totalAmount}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {order.items.map(item => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--beige)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                🌿 {item.name} × {item.quantity}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to={`/orders/${order._id}`} className="btn-outline" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Track Order
            </Link>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray)', alignSelf: 'center' }}>
              💳 {order.paymentMethod}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
