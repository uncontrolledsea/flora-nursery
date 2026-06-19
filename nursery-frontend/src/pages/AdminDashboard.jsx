import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Placed','Confirmed','Packed','Shipped','Out for Delivery','Delivered','Cancelled'];
const CATEGORIES = ['Indoor Plants','Outdoor Plants','Medicinal Plants','Flowering Plants','Succulents','Air Purifying Plants'];
const EMPTY_PRODUCT = { name:'', description:'', price:'', originalPrice:'', image:'', category:'Indoor Plants', stock:10, sunlight:'Medium', watering:'Twice per week', soil:'Well drained', difficulty:'Easy', petFriendly:true, season:[] };

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [editProductId, setEditProductId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    setLoading(true);
    if (tab === 'dashboard') fetchStats();
    else if (tab === 'orders') fetchOrders();
    else if (tab === 'products') fetchProducts();
  }, [tab]);

  const fetchStats = async () => {
    try { const { data } = await API.get('/orders/admin/stats'); setStats(data); }
    catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    try { const { data } = await API.get('/orders/admin/all'); setOrders(data); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try { const { data } = await API.get('/products?limit=100'); setProducts(data.products || data); }
    catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const { data } = await API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProductForm(p => ({ ...p, image: `https://flora-nursery.onrender.com/${data.imageUrl}` }));
      setImagePreview(`https://flora-nursery.onrender.com/${data.imageUrl}`);
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  // Use URL directly
  const handleImageUrl = (url) => {
    setProductForm(p => ({ ...p, image: url }));
    setImagePreview(url);
  };

  const resetForm = () => {
    setProductForm(EMPTY_PRODUCT);
    setEditProductId(null);
    setImagePreview('');
    setShowProductForm(false);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.description) {
      toast.error('Name, price and description are required'); return;
    }
    try {
      const payload = { ...productForm, price: Number(productForm.price), originalPrice: Number(productForm.originalPrice) || undefined, stock: Number(productForm.stock) };
      if (editProductId) {
        const { data } = await API.put(`/products/${editProductId}`, payload);
        setProducts(prev => prev.map(p => p._id === editProductId ? data : p));
        toast.success('Product updated!');
      } else {
        const { data } = await API.post('/products', payload);
        setProducts(prev => [data, ...prev]);
        toast.success('Product added!');
      }
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const startEdit = (p) => {
    setProductForm({ name:p.name, description:p.description, price:p.price, originalPrice:p.originalPrice||'', image:p.image||'', category:p.category, stock:p.stock, sunlight:p.sunlight, watering:p.watering, soil:p.soil, difficulty:p.difficulty, petFriendly:p.petFriendly, season:p.season||[] });
    setEditProductId(p._id);
    setImagePreview(p.image||'');
    setShowProductForm(true);
    window.scrollTo(0,0);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); setProducts(prev => prev.filter(p => p._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const filteredOrders = orders.filter(o =>
    o._id.toLowerCase().includes(searchOrder.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(searchOrder.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchOrder.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <h2>⚙️ Admin Panel</h2>
        <div style={{ background:'var(--green-pale)', color:'var(--green)', padding:'0.4rem 1rem', borderRadius:'20px', fontSize:'0.85rem', fontWeight:600 }}>
          👑 Admin Mode
        </div>
      </div>

      <div className="tabs">
        {[['dashboard','📊 Dashboard'],['orders','📦 Orders'],['products','🌿 Products']].map(([t,l]) => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {loading && (
        <div style={{ padding:'3rem', textAlign:'center', color:'var(--gray)' }}>
          <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>⏳</div>
          <p>Loading...</p>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {!loading && tab === 'dashboard' && stats && (
        <>
          <div className="stats-grid">
            {[
              { icon:'📦', label:'Total Orders', value: stats.totalOrders, color:'green' },
              { icon:'💰', label:'Total Revenue', value:`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`, color:'blue' },
              { icon:'🌿', label:'Total Products', value: stats.totalProducts, color:'orange' },
              { icon:'⏳', label:'Pending Orders', value: stats.ordersByStatus?.find(s=>s._id==='Placed')?.count||0, color:'red' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
              </div>
            ))}
          </div>

          {/* Revenue by status */}
          <div style={{ background:'white', borderRadius:'var(--radius)', padding:'1.5rem', boxShadow:'var(--shadow)', marginBottom:'2rem' }}>
            <h3 style={{ marginBottom:'1rem', color:'var(--green)' }}>📊 Orders by Status</h3>
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              {stats.ordersByStatus?.map(s => (
                <div key={s._id} style={{ background:'var(--beige)', padding:'0.6rem 1.2rem', borderRadius:'20px', fontSize:'0.85rem' }}>
                  <strong>{s._id}</strong>: {s.count}
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ marginBottom:'1rem', color:'var(--green)' }}>📋 Recent Orders</h3>
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recentOrders?.map(o => (
                  <tr key={o._id}>
                    <td><code style={{ fontSize:'0.8rem' }}>#{o._id.slice(-8).toUpperCase()}</code></td>
                    <td><div>{o.user?.name}</div><div style={{ fontSize:'0.75rem', color:'var(--gray)' }}>{o.user?.email}</div></td>
                    <td>{o.items?.length} item(s)</td>
                    <td><strong>₹{o.totalAmount}</strong></td>
                    <td>{o.paymentMethod}</td>
                    <td><span style={{ fontWeight:600, color:'var(--green)' }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ORDERS ── */}
      {!loading && tab === 'orders' && (
        <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem' }}>
            <h3>All Orders ({filteredOrders.length})</h3>
            <input placeholder="🔍 Search by order ID, name or email..." value={searchOrder}
              onChange={e => setSearchOrder(e.target.value)}
              style={{ padding:'0.5rem 1rem', border:'2px solid #e5e5e5', borderRadius:'8px', fontSize:'0.9rem', width:'280px', outline:'none' }} />
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o._id}>
                    <td><code style={{ fontSize:'0.8rem' }}>#{o._id.slice(-8).toUpperCase()}</code></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--gray)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ fontWeight:600 }}>{o.user?.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray)' }}>{o.user?.email}</div>
                    </td>
                    <td>
                      {o.items?.slice(0,2).map((i,idx) => <div key={idx} style={{ fontSize:'0.8rem' }}>🌿 {i.name} ×{i.quantity}</div>)}
                      {o.items?.length > 2 && <div style={{ fontSize:'0.75rem', color:'var(--gray)' }}>+{o.items.length-2} more</div>}
                    </td>
                    <td><strong>₹{o.totalAmount}</strong></td>
                    <td>
                      <div style={{ fontSize:'0.85rem' }}>{o.paymentMethod}</div>
                      <div style={{ fontSize:'0.75rem', color: o.paymentStatus==='Paid' ? 'var(--green)' : 'var(--orange)' }}>{o.paymentStatus}</div>
                    </td>
                    <td>
                      <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                        style={{ padding:'0.35rem 0.5rem', borderRadius:'6px', border:'1px solid #ddd', fontSize:'0.82rem', cursor:'pointer' }}>
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'var(--gray)' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── PRODUCTS ── */}
      {!loading && tab === 'products' && (
        <>
          {/* Product Form */}
          {showProductForm && (
            <div style={{ background:'white', borderRadius:'var(--radius)', padding:'2rem', boxShadow:'var(--shadow)', marginBottom:'2rem', border:'2px solid var(--green-pale)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h3 style={{ color:'var(--green)' }}>{editProductId ? '✏️ Edit Product' : '➕ Add New Plant'}</h3>
                <button onClick={resetForm} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'var(--gray)' }}>✕</button>
              </div>

              <form onSubmit={saveProduct}>
                {/* Image Section */}
                <div style={{ marginBottom:'1.5rem', padding:'1.2rem', background:'var(--beige)', borderRadius:'var(--radius)' }}>
                  <label style={{ display:'block', fontWeight:600, marginBottom:'0.8rem', color:'var(--green)' }}>🖼️ Plant Image</label>
                  <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap' }}>
                    {/* Preview */}
                    <div style={{ width:120, height:120, border:'2px dashed #ccc', borderRadius:'var(--radius)', overflow:'hidden', flexShrink:0, background:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={() => setImagePreview('')} />
                      ) : (
                        <span style={{ fontSize:'2.5rem' }}>🌿</span>
                      )}
                    </div>

                    <div style={{ flex:1, minWidth:200 }}>
                      {/* Upload button */}
                      <button type="button" className="btn-outline"
                        onClick={() => fileRef.current.click()}
                        disabled={uploading}
                        style={{ marginBottom:'0.8rem', width:'100%' }}>
                        {uploading ? '⏳ Uploading...' : '📁 Upload Image from Computer'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />

                      <div style={{ textAlign:'center', color:'var(--gray)', fontSize:'0.8rem', margin:'0.5rem 0' }}>— or paste image URL —</div>

                      <input
                        placeholder="https://example.com/plant.jpg"
                        value={productForm.image}
                        onChange={e => handleImageUrl(e.target.value)}
                        style={{ width:'100%', padding:'0.6rem', border:'1px solid #ddd', borderRadius:'6px', fontSize:'0.85rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label>Plant Name *</label>
                    <input value={productForm.name} onChange={e => setProductForm(p=>({...p,name:e.target.value}))} required placeholder="e.g. Money Plant" />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={productForm.category} onChange={e => setProductForm(p=>({...p,category:e.target.value}))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select value={productForm.difficulty} onChange={e => setProductForm(p=>({...p,difficulty:e.target.value}))}>
                      {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₹) *</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm(p=>({...p,price:e.target.value}))} required placeholder="e.g. 249" />
                  </div>
                  <div className="form-group">
                    <label>Original Price (₹) <span style={{ color:'var(--gray)', fontWeight:400 }}>(for discount)</span></label>
                    <input type="number" value={productForm.originalPrice} onChange={e => setProductForm(p=>({...p,originalPrice:e.target.value}))} placeholder="e.g. 349" />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" value={productForm.stock} onChange={e => setProductForm(p=>({...p,stock:e.target.value}))} required min="0" />
                  </div>
                  <div className="form-group" style={{ display:'flex', alignItems:'center', gap:'0.5rem', paddingTop:'1.5rem' }}>
                    <input type="checkbox" id="petFriendly" checked={productForm.petFriendly} onChange={e => setProductForm(p=>({...p,petFriendly:e.target.checked}))} style={{ width:18, height:18, accentColor:'var(--green)' }} />
                    <label htmlFor="petFriendly" style={{ margin:0, cursor:'pointer' }}>🐾 Pet Friendly</label>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom:'1rem' }}>
                  <label>Description *</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(p=>({...p,description:e.target.value}))} required rows={3}
                    placeholder="Describe the plant — its benefits, appearance, where it grows best..."
                    style={{ width:'100%', padding:'0.7rem', border:'2px solid #e5e5e5', borderRadius:'8px', resize:'vertical', fontSize:'0.9rem', outline:'none', fontFamily:'inherit' }} />
                </div>

                {/* Care Guide */}
                <div style={{ padding:'1.2rem', background:'var(--green-pale)', borderRadius:'var(--radius)', marginBottom:'1.5rem' }}>
                  <label style={{ display:'block', fontWeight:600, marginBottom:'1rem', color:'var(--green)' }}>🌿 Plant Care Guide</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <div className="form-group">
                      <label>☀️ Sunlight</label>
                      <input value={productForm.sunlight} onChange={e => setProductForm(p=>({...p,sunlight:e.target.value}))} placeholder="e.g. Bright Indirect" />
                    </div>
                    <div className="form-group">
                      <label>💧 Watering</label>
                      <input value={productForm.watering} onChange={e => setProductForm(p=>({...p,watering:e.target.value}))} placeholder="e.g. Twice per week" />
                    </div>
                    <div className="form-group" style={{ gridColumn:'1/-1' }}>
                      <label>🪴 Soil Type</label>
                      <input value={productForm.soil} onChange={e => setProductForm(p=>({...p,soil:e.target.value}))} placeholder="e.g. Well drained potting mix" />
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:'1rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex:1, padding:'0.9rem', fontSize:'1rem' }}>
                    {editProductId ? '✅ Update Product' : '✅ Add Product'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm} style={{ padding:'0.9rem 1.5rem' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Products List Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem' }}>
            <h3>All Plants ({filteredProducts.length})</h3>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <input placeholder="🔍 Search plants..."
                value={searchProduct} onChange={e => setSearchProduct(e.target.value)}
                style={{ padding:'0.5rem 1rem', border:'2px solid #e5e5e5', borderRadius:'8px', fontSize:'0.9rem', outline:'none' }} />
              {!showProductForm && (
                <button className="btn-primary" onClick={() => { resetForm(); setShowProductForm(true); window.scrollTo(0,0); }}>
                  + Add New Plant
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Image</th><th>Plant</th><th>Category</th><th>Price</th><th>Original</th><th>Stock</th><th>Rating</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p._id}>
                    <td>
                      <img src={p.image} alt={p.name}
                        style={{ width:50, height:50, objectFit:'cover', borderRadius:8 }}
                        onError={e => { e.target.src=''; e.target.style.display='none'; e.target.parentNode.innerHTML='🌿'; }} />
                    </td>
                    <td>
                      <div style={{ fontWeight:600 }}>{p.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray)' }}>{p.difficulty} · {p.petFriendly?'🐾':'⚠️'}</div>
                    </td>
                    <td><span className="category-tag" style={{ fontSize:'0.75rem' }}>{p.category}</span></td>
                    <td><strong style={{ color:'var(--green)' }}>₹{p.price}</strong></td>
                    <td style={{ color:'var(--gray)', textDecoration:'line-through', fontSize:'0.85rem' }}>
                      {p.originalPrice ? `₹${p.originalPrice}` : '—'}
                    </td>
                    <td>
                      <span style={{ color: p.stock===0 ? 'var(--red)' : p.stock<=5 ? 'var(--orange)' : 'var(--green)', fontWeight:600 }}>
                        {p.stock===0 ? '⚠️ Out' : p.stock}
                      </span>
                    </td>
                    <td>⭐ {p.rating?.toFixed(1)||'0.0'} <span style={{ color:'var(--gray)', fontSize:'0.8rem' }}>({p.numReviews})</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button className="btn-outline" style={{ padding:'0.3rem 0.8rem', fontSize:'0.8rem' }} onClick={() => startEdit(p)}>✏️ Edit</button>
                        <button className="btn-danger" style={{ padding:'0.3rem 0.8rem', fontSize:'0.8rem' }} onClick={() => deleteProduct(p._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length===0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'var(--gray)' }}>No plants found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
