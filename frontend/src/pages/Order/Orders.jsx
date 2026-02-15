import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import './Orders.css';

// Mock data cho đơn hàng (sau này sẽ thay bằng API call)
const mockOrders = [
  {
    id: 'DH001',
    date: '2024-01-15T10:30:00',
    status: 'delivered',
    items: [
      {
        id: 1,
        name: 'Áo thun nam',
        price: 250000,
        quantity: 2,
        size: 'L',
        color: { name: 'Đen' }
      },
      {
        id: 2,
        name: 'Quần jean nữ',
        price: 450000,
        quantity: 1,
        size: 'M',
        color: { name: 'Xanh' }
      }
    ],
    shippingInfo: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      address: '123 Đường ABC, Phường XYZ',
      city: 'hcm'
    },
    paymentMethod: 'cod',
    note: 'Giao hàng giờ hành chính',
    totalAmount: 950000
  },
  {
    id: 'DH002',
    date: '2024-01-14T15:45:00',
    status: 'shipping',
    items: [
      {
        id: 3,
        name: 'Giày thể thao',
        price: 650000,
        quantity: 1,
        size: '42',
        color: { name: 'Trắng' }
      }
    ],
    shippingInfo: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      address: '123 Đường ABC, Phường XYZ',
      city: 'hcm'
    },
    paymentMethod: 'banking',
    note: '',
    totalAmount: 680000
  }
];

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load orders from localStorage or API
    loadOrders();
  }, []);

  const loadOrders = () => {
    // Thử lấy orders từ localStorage trước
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Nếu không có, dùng mock data
      setOrders(mockOrders);
      localStorage.setItem('orders', JSON.stringify(mockOrders));
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'shipping': 'status-shipping',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCityName = (cityCode) => {
    const cities = {
      'hcm': 'Hồ Chí Minh',
      'hanoi': 'Hà Nội',
      'danang': 'Đà Nẵng',
      'haiphong': 'Hải Phòng',
      'cantho': 'Cần Thơ'
    };
    return cities[cityCode] || cityCode;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'cod': 'Trả tiền khi nhận hàng',
      'banking': 'Chuyển khoản ngân hàng',
      'momo': 'Ví MoMo'
    };
    return methods[method] || method;
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      alert('Đã hủy đơn hàng thành công!');
    }
  };

  const handleReorder = (order) => {
    // Thêm các sản phẩm từ order vào giỏ hàng
    order.items.forEach(item => {
      // Dispatch action add to cart
      // dispatch(addToCart(item));
    });
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>Đơn hàng của tôi</h1>
        <div className="empty-orders">
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bạn chưa đặt đơn hàng nào. Hãy mua sắm ngay!</p>
          <button onClick={handleContinueShopping} className="btn-shop">
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>Đơn hàng của tôi</h1>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-id">Mã đơn: {order.id}</span>
                <span className="order-date">Ngày đặt: {formatDate(order.date)}</span>
              </div>
              <span className={`order-status ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="order-body">
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      {item.size && <span className="item-variant">Size: {item.size}</span>}
                      {item.color && <span className="item-variant">Màu: {item.color.name}</span>}
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-footer">
              <div className="order-total">
                Tổng tiền:
                <span className="total-amount">{order.totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="order-actions">
                <button
                  className="btn-detail"
                  onClick={() => handleViewDetail(order)}
                >
                  Chi tiết
                </button>
                {order.status === 'pending' && (
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Hủy đơn
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button
                    className="btn-detail"
                    onClick={() => handleReorder(order)}
                  >
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal chi tiết đơn hàng */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

            <h2 className="modal-title">Chi tiết đơn hàng {selectedOrder.id}</h2>

            <div className="order-detail-section">
              <h3>Thông tin giao hàng</h3>
              <div className="detail-row">
                <span className="detail-label">Người nhận:</span>
                <span className="detail-value">{selectedOrder.shippingInfo.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">{selectedOrder.shippingInfo.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedOrder.shippingInfo.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Địa chỉ:</span>
                <span className="detail-value">
                  {selectedOrder.shippingInfo.address}, {getCityName(selectedOrder.shippingInfo.city)}
                </span>
              </div>
            </div>

            <div className="order-detail-section">
              <h3>Phương thức thanh toán</h3>
              <div className="detail-row">
                <span className="detail-label">Phương thức:</span>
                <span className="detail-value">
                  <span className="payment-method">
                    {getPaymentMethodText(selectedOrder.paymentMethod)}
                  </span>
                </span>
              </div>
              {selectedOrder.note && (
                <div className="detail-row">
                  <span className="detail-label">Ghi chú:</span>
                  <span className="detail-value">{selectedOrder.note}</span>
                </div>
              )}
            </div>

            <div className="order-detail-section">
              <h3>Sản phẩm đã đặt</h3>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    {item.size && <span className="item-variant">Size: {item.size}</span>}
                    {item.color && <span className="item-variant">Màu: {item.color.name}</span>}
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-price">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </span>
                </div>
              ))}

              <div style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '15px' }}>
                <div className="detail-row">
                  <span className="detail-label">Tạm tính:</span>
                  <span className="detail-value">
                    {selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phí vận chuyển:</span>
                  <span className="detail-value">
                    {selectedOrder.totalAmount > 500000 ? 'Miễn phí' : '30,000đ'}
                  </span>
                </div>
                <div className="detail-row" style={{ fontWeight: '600', marginTop: '10px' }}>
                  <span className="detail-label">Tổng cộng:</span>
                  <span className="detail-value" style={{ color: '#4CAF50', fontSize: '18px' }}>
                    {selectedOrder.totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;