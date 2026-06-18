import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../App';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      setLoading(true);
      const { data } = await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(data);
      toast.success(`Welcome to FloraNursery, ${data.name}! 🌿`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="form-box">
        <h2>🌿 Join FloraNursery</h2>
        <form onSubmit={handleSubmit}>
          {[
            { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
            { field: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
            { field: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
            { field: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field} className="form-group">
              <label>{label}</label>
              <input type={type} placeholder={placeholder} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" className="btn-block" disabled={loading}>
            {loading ? '⏳ Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--gray)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
