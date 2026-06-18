import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../App';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Confirm'];

// Load Razorpay script dynamically
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const shipping = cartTotal >= 499 ? 0 : 49;
  const total = cartTotal + shipping;

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await API.get('/addresses');
      setAddresses(data);
      const def = data.find(a => a.isDefault);
      if (def) setSelectedAddr(def._id);
      else if (data.length > 0) setSelectedAddr(data[0]._id);
    } catch {}
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/addresses', form);
      setAddresses(prev => [...prev, data]);
      setSelectedAddr(data._id);
      setShowAddForm(false);
      setForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
      toast.success('Address saved!');
    } catch { toast.error('Failed to save address'); }
  };

  // Place order (COD)
  const placeOrderCOD = async () => {
    const addr = addresses.find(a => a._id === selectedAddr);
    try {
      setPlacing(true);
      const { data } = await API.post('/orders', {
        items: cart.map(i => ({ product: i._id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
        shippingAddress: addr,
        paymentMethod: 'COD',
        totalAmount: total,
      });
      clearCart();
      navigate(`/order-success/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setPlacing(false); }
  };

  // Place order with Razorpay
  const placeOrderRazorpay = async () => {
    const addr = addresses.find(a => a._id === selectedAddr);
    try {
      setPlacing(true);

      // Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setPlacing(false);
        return;
      }

      // Create Razorpay order on backend
      const { data: rzpOrder } = await API.post('/payment/create-order', { amount: total });

      // First create the nursery order in DB (pending payment)
      const { data: nurseryOrder } = await API.post('/orders', {
        items: cart.map(i => ({ product: i._id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
        shippingAddress: addr,
        paymentMethod,
        totalAmount: total,
        paymentStatus: 'Pending',
      });

      // Open Razorpay checkout
      const options = {
        key: rzpOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'FloraNursery',
        description: `Order #${nurseryOrder._id.slice(-8).toUpperCase()}`,
        order_id: rzpOrder.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: nurseryOrder._id,
            });
            clearCart();
            toast.success('Payment successful! 🎉');
            navigate(`/order-success/${nurseryOrder._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: addr.name,
          contact: addr.phone,
        },
        theme: { color: '#2d6a4f' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your order is saved as pending.', { icon: 'ℹ️' });
            setPlacing(false);
          }
        }
      };

      console.log("Razorpay Key:", options.key);

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'COD') placeOrderCOD();
    else placeOrderRazorpay();
  };

  const selectedAddress = addresses.find(a => a._id === selectedAddr);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page" style={{ maxWidth: 750 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--green)' }}>🛒 Checkout</h2>

      {/* Steps */}
      <div className="checkout-steps" style={{ marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      {/* Order Summary - always visible */}
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1rem 1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
          {cart.length} item(s) · Shipping: {shipping === 0 ? <span style={{ color: 'var(--green)' }}>FREE</span> : `₹${shipping}`}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--green)' }}>Total: ₹{total}</div>
      </div>

      {/* STEP 0: Address */}
      {step === 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>📍 Select Delivery Address</h3>

          {addresses.map(a => (
            <div key={a._id} className={`address-card ${selectedAddr === a._id ? 'selected' : ''}`} onClick={() => setSelectedAddr(a._id)}>
              {a.isDefault && <span className="default-badge">Default</span>}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="radio" readOnly checked={selectedAddr === a._id} style={{ accentColor: 'var(--green)' }} />
                <div>
                  <strong>{a.name}</strong> · {a.phone}
                  <div style={{ color: 'var(--gray)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {a.address}, {a.city}, {a.state} - {a.pincode}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {showAddForm ? (
            <form onSubmit={saveAddress} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--green)' }}>+ New Address</h4>
              <div className="form-grid">
                {[['name','Name'],['phone','Phone Number'],['city','City'],['state','State'],['pincode','Pincode']].map(([f,l]) => (
                  <div key={f} className="form-group">
                    <label>{l}</label>
                    <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} required placeholder={l} />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Full Address</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required placeholder="House No, Street, Landmark" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">Save & Use This Address</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="btn-outline" style={{ marginTop: '0.8rem', width: '100%' }} onClick={() => setShowAddForm(true)}>
              + Add New Address
            </button>
          )}

          <button className="btn-block" style={{ marginTop: '1.5rem' }}
            onClick={() => { if (!selectedAddr) { toast.error('Please select an address'); return; } setStep(1); }}>
            Continue to Payment →
          </button>
        </div>
      )}

      {/* STEP 1: Payment */}
      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>💳 Select Payment Method</h3>

          {[
            { id: 'COD', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your plants arrive at your door' },
            { id: 'Razorpay', icon: '💳', label: 'Online Payment (Razorpay)', desc: 'UPI, Cards, Net Banking, Wallets — all in one' },
          ].map(opt => (
            <div key={opt.id} className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}
              onClick={() => setPaymentMethod(opt.id)}>
              <input type="radio" readOnly checked={paymentMethod === opt.id} style={{ accentColor: 'var(--green)' }} />
              <span className="payment-icon">{opt.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{opt.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{opt.desc}</div>
              </div>
            </div>
          ))}

          {paymentMethod === 'Razorpay' && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: '0.3rem' }}>🔒 Secure Payment via Razorpay</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                Supports: GPay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay, Net Banking & more.<br />
                256-bit SSL encrypted. Your card details are never stored.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
                {['GPay', 'PhonePe', 'Paytm', 'UPI', 'Visa', 'MC', 'RuPay'].map(p => (
                  <span key={p} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === 'COD' && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                ℹ️ Pay in cash when your order is delivered. Please keep exact change ready.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn-outline" onClick={() => setStep(0)}>← Back</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>
              Review Order →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Confirm */}
      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>✅ Review & Confirm</h3>

          {/* Items */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--green)', marginBottom: '1rem' }}>📦 Items</h4>
            {cart.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.9rem' }}>
                <div>🌿 {item.name} <span style={{ color: 'var(--gray)' }}>× {item.quantity}</span></div>
                <div style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</div>
              </div>
            ))}
            <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray)' }}>
              <span>Subtotal</span><span>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray)', marginTop: '0.3rem' }}>
              <span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--green)' }}>FREE</span> : `₹${shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)', borderTop: '2px solid #eee', marginTop: '0.7rem', paddingTop: '0.7rem' }}>
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>

          {/* Address */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--green)', marginBottom: '0.8rem' }}>📍 Delivering To</h4>
            {selectedAddress && (
              <div style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--dark)' }}>{selectedAddress.name}</strong> · {selectedAddress.phone}<br />
                {selectedAddress.address}<br />
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--green)', marginBottom: '0.5rem' }}>💳 Payment</h4>
            <div style={{ fontSize: '0.95rem' }}>
              {paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment via Razorpay'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" style={{ flex: 1, fontSize: '1rem', padding: '0.9rem' }}
              onClick={handlePlaceOrder} disabled={placing}>
              {placing ? '⏳ Processing...' : paymentMethod === 'COD' ? '✅ Place Order (COD)' : '💳 Pay ₹' + total + ' Now'}
            </button>
          </div>

          {paymentMethod === 'Razorpay' && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.8rem' }}>
              🔒 You will be redirected to Razorpay's secure payment page
            </p>
          )}
        </div>
      )}
    </div>
  );
}
