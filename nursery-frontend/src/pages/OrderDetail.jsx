import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ALL_STEPS = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => toast.error('Order not found')).finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      setCancelling(true);
      const { data } = await API.put(`/orders/${id}/cancel`);
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="spinner" style={{ paddingTop: '4rem' }} />;
  if (!order) return null;

  const currentIdx = order.status === 'Cancelled' ? -1 : ALL_STEPS.indexOf(order.status);

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <Link to="/orders" style={{ color: 'var(--green)', textDecoration: 'none' }}>← Back to Orders</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.5rem' }}>
        <h2>Order Details</h2>
        {!['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status) && (
          <button className="btn-danger" onClick={cancelOrder} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Tracking Timeline */}
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow)', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--green)' }}>📍 Order Tracking</h3>
        {order.status === 'Cancelled' ? (
          <div className="alert alert-error">❌ This order has been cancelled.</div>
        ) : (
          <div className="tracking-timeline">
            {ALL_STEPS.map((s, i) => {
              const isDone = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={s} className="tracking-step">
                  <div className={`track-dot ${isDone ? 'done' : isCurrent ? 'current' : ''}`} />
                  <div className="track-info">
                    <h4 style={{ color: isDone || isCurrent ? 'var(--dark)' : 'var(--gray)' }}>
                      {isCurrent ? '🔄 ' : isDone ? '✅ ' : '○ '}{s}
                    </h4>
                    {(isDone || isCurrent) && order.trackingHistory?.find(t => t.status === s) && (
                      <div className="date">{new Date(order.trackingHistory.find(t => t.status === s).timestamp).toLocaleString('en-IN')}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--green)' }}>📦 Items Ordered</h3>
        {order.items.map(item => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>🌿 <strong>{item.name}</strong> × {item.quantity}</div>
            <div>₹{item.price * item.quantity}</div>
          </div>
        ))}
        <div style={{ marginTop: '0.7rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--green)' }}>
          <span>Total</span><span>₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Address */}
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ marginBottom: '0.8rem', color: 'var(--green)' }}>📍 Delivery Address</h3>
        <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <strong>{order.shippingAddress?.name}</strong> · {order.shippingAddress?.phone}<br />
          {order.shippingAddress?.address}<br />
          {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
        </p>
        <p style={{ marginTop: '0.8rem', fontSize: '0.9rem' }}>
          <strong>Payment:</strong> {order.paymentMethod} · <strong>Status:</strong> {order.paymentStatus}
        </p>
      </div>
    </div>
  );
}
