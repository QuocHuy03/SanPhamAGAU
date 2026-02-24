import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { orderService } from '../../services/orderService';
import './CheckOut.css';

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
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

  const calculateSubtotal = () => {
    return items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 500000 ? 0 : 30000;
    return subtotal + shipping;
  };

  const shippingFee = calculateSubtotal() > 500000 ? 0 : 30000;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      alert('Giỏ hàng trống!');
      navigate('/cart');
      return;
    }

    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng!');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const subtotal = calculateSubtotal();
      const total = calculateTotal();

      // Map cart items sang order items format
      const orderItems = items.map(item => ({
        product: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color?.name || item.color || '',
        image: item.images?.[0]?.url || item.image || ''
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          note: formData.note
        },
        paymentMethod: formData.paymentMethod === 'banking' ? 'bank_transfer' : formData.paymentMethod,
        shippingMethod: 'standard',
        shippingFee,
        subtotal,
        total,
        note: formData.note
      };

      await orderService.createOrder(orderData);

      // Xóa cart sau khi đặt hàng thành công
      dispatch(clearCart());

      alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
      navigate('/order');
    } catch (error) {
      console.error('Order error:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="checkout-container">
        <h1>Thanh toán đơn hàng</h1>
        <div className="empty-cart">
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
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
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Nhập họ và tên"
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
                placeholder="example@email.com"
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
                placeholder="0123456789"
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
              <div className="payment-methods">
                <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <span>Trả tiền khi nhận hàng</span>
                </label>
                <label className={`payment-option ${formData.paymentMethod === 'banking' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="banking"
                    checked={formData.paymentMethod === 'banking'}
                    onChange={handleChange}
                  />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
                <label className={`payment-option ${formData.paymentMethod === 'momo' ? 'selected' : ''}`}>
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
              />
            </div>

            <button type="submit" className="checkout-btn" disabled={loading}>
              {loading ? 'Đang đặt hàng...' : 'Đặt hàng'}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Đơn hàng của bạn</h2>

          <div className="cart-items">
            {items.map(item => (
              <div key={item.id || item._id} className="cart-item">
                <div className="cart-item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="item-meta">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Màu: {item.color?.name || item.color}</span>}
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                </div>
                <span className="item-price">
                  {(item.price * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{calculateSubtotal().toLocaleString()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ color: shippingFee === 0 ? 'var(--success)' : 'inherit' }}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
              </span>
            </div>
            {shippingFee === 0 && (
              <div className="free-shipping-badge">
                Miễn phí vận chuyển cho đơn hàng từ 500,000đ
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{calculateTotal().toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
