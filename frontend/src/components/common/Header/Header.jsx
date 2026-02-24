import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';
import CartIcon from './CartIcon';
import SearchBar from './SearchBar';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <h1>ShopThoiTrang</h1>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
            <button
              className="nav-close"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTimes />
            </button>
            <ul className="nav-list">
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link></li>
              <li><Link to="/shop" onClick={() => setIsMenuOpen(false)}>Cửa hàng</Link></li>
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link></li>
              <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Liên hệ</Link></li>
            </ul>
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            <LanguageSwitcher />
            <Link to="/cart" className="cart-icon">
              <CartIcon count={itemCount} />
            </Link>

            <Link to={isAuthenticated ? "/profile" : "/login"} className="user-icon">
              <FaUser />
              {isAuthenticated && user?.name && (
                <span className="user-name-mobile">{user.name.split(' ').pop()}</span>
              )}
            </Link>

            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* User info for desktop */}
        {isAuthenticated && user && (
          <div className="user-info">
            <span>Xin chào, <Link to="/profile" className="user-name">{user.name}</Link></span>
            {user.role === 'admin' && (
              <Link to="/admin" className="admin-link">Admin</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;