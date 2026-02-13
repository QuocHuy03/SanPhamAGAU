import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './CheckOut.css';

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart); // ✅ Sửa ở đây
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    address: '',
    city: '',
    phone: user?.phone || '',
    paymentMethod: 'cod',
    note: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra giỏ hàng
    if (!items || items.length === 0) { // ✅ Sửa ở đây
      alert('Giỏ hàng trống!');
      navigate('/cart');
      return;
    }

    // Xử lý đặt hàng
    const orderData = {
      ...formData,
      items: items, // ✅ Sửa ở đây
      totalAmount: calculateTotal(),
      orderDate: new Date().toISOString()
    };

    console.log('Đơn hàng:', orderData);
    
    alert('Đặt hàng thành công!');
    navigate('/orders');
  };

  const calculateSubtotal = () => {
    return items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0; // ✅ Sửa ở đây
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 500000 ? 0 : 30000;
    return subtotal + shipping;
  };

  const shippingFee = calculateSubtotal() > 500000 ? 0 : 30000;

  // Nếu giỏ hàng trống, hiển thị thông báo
  if (!items || items.length === 0) {
    return (
      <div className="checkout-container">
        <h1>Thanh toán đơn hàng</h1>
        <div className="empty-cart" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <button 
            onClick={() => navigate('/shop')}
            className="btn-primary"
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Thanh toán đơn hàng</h1>
      
      <div className="checkout-content">
        <div className="checkout-form">
          <h2>Thông tin giao hàng</h2>
          <form onSubmit={handleSubmit}>
            {/* Form fields - giữ nguyên */}
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Số nhà, tên đường, phường/xã"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thành phố *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn thành phố</option>
                  <option value="hcm">Hồ Chí Minh</option>
                  <option value="hanoi">Hà Nội</option>
                  <option value="danang">Đà Nẵng</option>
                  <option value="haiphong">Hải Phòng</option>
                  <option value="cantho">Cần Thơ</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Phương thức thanh toán *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="banking"
                    checked={formData.paymentMethod === 'banking'}
                    onChange={handleChange}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={formData.paymentMethod === 'momo'}
                    onChange={handleChange}
                  />
                  <span>Ví MoMo</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="3"
                placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng giờ hành chính"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <button 
              type="submit" 
              className="checkout-btn"
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Đặt hàng
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Đơn hàng của bạn</h2>
          
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <span className="item-name">{item.name}</span>
                  {item.size && <span style={{ marginLeft: '10px', color: '#666' }}>Size: {item.size}</span>}
                  {item.color && <span style={{ marginLeft: '10px', color: '#666' }}>Màu: {item.color.name}</span>}
                  <span className="item-quantity" style={{ marginLeft: '10px', color: '#999' }}>x{item.quantity}</span>
                </div>
                <span className="item-price" style={{ fontWeight: '600' }}>
                  {(item.price * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
          
          <div className="summary-details" style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Tạm tính</span>
              <span>{calculateSubtotal().toLocaleString()}đ</span>
            </div>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Phí vận chuyển</span>
              <span style={{ color: shippingFee === 0 ? '#4CAF50' : 'inherit' }}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
              </span>
            </div>
            {shippingFee === 0 && (
              <div style={{ color: '#4CAF50', fontSize: '14px', marginBottom: '10px' }}>
                🎉 Miễn phí vận chuyển cho đơn hàng từ 500,000đ
              </div>
            )}
            <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #ddd', fontSize: '18px', fontWeight: '600' }}>
              <span>Tổng cộng</span>
              <span style={{ color: '#4CAF50' }}>{calculateTotal().toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;