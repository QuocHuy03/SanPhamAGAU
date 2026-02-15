import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Liên hệ với chúng tôi</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe bạn!</p>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-item">
              <h3>📍 Địa chỉ</h3>
              <p>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
            </div>
            <div className="info-item">
              <h3>📧 Email</h3>
              <p>contact@shopthoitrang.com</p>
            </div>
            <div className="info-item">
              <h3>📞 Số điện thoại</h3>
              <p>0123 456 789</p>
            </div>
          </div>

          <form className="contact-form">
            <div className="form-group">
              <label>Họ tên</label>
              <input type="text" placeholder="Nhập họ tên của bạn" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Nhập email của bạn" />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea rows="5" placeholder="Bạn cần hỗ trợ gì?"></textarea>
            </div>
            <button type="submit" className="submit-btn">Gửi tin nhắn</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;