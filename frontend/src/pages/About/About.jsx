import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>Về Chúng Tôi</h1>
        <div className="about-content">
          <div className="about-text">
            <h2>Shop Thời Trang - Phong Cách Của Bạn</h2>
            <p>
              Chào mừng bạn đến với Shop Thời Trang, nơi chúng tôi mang đến những xu hướng thời trang mới nhất và chất lượng nhất.
              Với sứ mệnh giúp mọi người tự tin thể hiện cá tính qua trang phục, chúng tôi không ngừng nỗ lực tìm kiếm và cung cấp
              những sản phẩm đa dạng từ phong cách công sở thanh lịch đến dạo phố năng động.
            </p>
            <p>
              Chúng tôi cam kết chất lượng sản phẩm tốt nhất với giá cả hợp lý, cùng dịch vụ chăm sóc khách hàng tận tâm.
            </p>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Shop Interior" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;