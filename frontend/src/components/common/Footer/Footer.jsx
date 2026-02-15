import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">Shop Thời Trang</h3>
            <p className="footer-text">
              Chuyên cung cấp quần áo thời trang chất lượng cao với giá cả hợp lý.
            </p>
            <div className="social-links" style={{ display: 'none' }}>
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Youtube</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/shop">Cửa hàng</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3 className="footer-title">Danh mục</h3>
            <ul className="footer-links">
              <li><Link to="/shop?category=ao-thun">Áo thun</Link></li>
              <li><Link to="/shop?category=ao-so-mi">Áo sơ mi</Link></li>
              <li><Link to="/shop?category=quan-jean">Quần jean</Link></li>
              <li><Link to="/shop?category=dam-vay">Đầm/Váy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Thông tin liên hệ</h3>
            <ul className="footer-contact">
              <li>123 Đường ABC, Quận 1, TP.HCM</li>
              <li>0123 456 789</li>
              <li>contact@shopthoitrang.com</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Shop Thời Trang. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;