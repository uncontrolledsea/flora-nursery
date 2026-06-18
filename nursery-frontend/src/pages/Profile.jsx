import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../App';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [tab, setTab] = useState('profile');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false });

  useEffect(() => {
    if (tab === 'addresses') fetchAddresses();
  }, [tab]);

  const fetchAddresses = async () => {
    try { const { data } = await API.get('/addresses'); setAddresses(data); } catch {}
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await API.put(`/addresses/${editId}`, form);
        setAddresses(prev => prev.map(a => a._id === editId ? data : a));
        toast.success('Address updated!');
      } else {
        const { data } = await API.post('/addresses', form);
        setAddresses(prev => [...prev, data]);
        toast.success('Address added!');
      }
      setShowForm(false); setEditId(null); setForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false });
    } catch { toast.error('Failed to save address'); }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try { await API.delete(`/addresses/${id}`); setAddresses(prev => prev.filter(a => a._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const startEdit = (addr) => {
    setForm({ name: addr.name, phone: addr.phone, address: addr.address, city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault });
    setEditId(addr._id); setShowForm(true);
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h2 style={{ marginBottom: '1.5rem' }}>👤 My Account</h2>

      <div className="tabs">
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`tab ${tab === 'addresses' ? 'active' : ''}`} onClick={() => setTab('addresses')}>My Addresses</button>
      </div>

      {tab === 'profile' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', align: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{user?.name}</h3>
              <p style={{ color: 'var(--gray)' }}>{user?.email}</p>
              <span style={{ background: user?.role === 'admin' ? '#fef3c7' : 'var(--green-pale)', color: user?.role === 'admin' ? '#92400e' : 'var(--green)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600 }}>
                {user?.role === 'admin' ? '👑 Admin' : '🌿 Member'}
              </span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', color: 'var(--gray)', fontSize: '0.9rem' }}>
            <p>📧 {user?.email}</p>
            <p style={{ marginTop: '0.5rem' }}>🏷️ Role: {user?.role}</p>
          </div>
        </div>
      )}

      {tab === 'addresses' && (
        <div>
          {addresses.map(a => (
            <div key={a._id} className="address-card" style={{ cursor: 'default' }}>
              {a.isDefault && <span className="default-badge">Default</span>}
              <strong>{a.name}</strong> · {a.phone}
              <div style={{ color: 'var(--gray)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {a.address}, {a.city}, {a.state} - {a.pincode}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button className="btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => startEdit(a)}>Edit</button>
                <button className="btn-danger" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => deleteAddress(a._id)}>Delete</button>
              </div>
            </div>
          ))}

          {showForm ? (
            <form onSubmit={saveAddress} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>{editId ? 'Edit Address' : 'New Address'}</h4>
              <div className="form-grid">
                {[['name', 'Name'], ['phone', 'Phone'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} required />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Address</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                Set as default address
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false }); setEditId(null); setShowForm(true); }}>
              + Add New Address
            </button>
          )}
        </div>
      )}
    </div>
  );
}
