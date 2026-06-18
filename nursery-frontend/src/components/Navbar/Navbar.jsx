import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../../App';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🌿 FloraNursery</Link>

      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search plants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/cart">
          🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">❤️ Wishlist</Link>
            <Link to="/profile">👤 {user.name.split(' ')[0]}</Link>
            {user.role === 'admin' && <Link to="/admin">⚙️ Admin</Link>}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
