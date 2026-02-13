import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { orderService } from '../../../services/orderService';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { ORDER_STATUS } from '../../../utils/constants';
import './Orders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const filteredOrders = selectedStatus
    ? orders.filter(order => order.status === selectedStatus)
    : orders;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle />;
      case 'shipped':
        return <FaTruck />;
      case 'cancelled':
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-orders">
      <div className="orders-header">
        <h1>Đơn hàng của tôi</h1>
        <div className="status-filter">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Tất cả đơn hàng</option>
            {Object.entries(ORDER_STATUS).map(([key, status]) => (
              <option key={key} value={key}>{status.text}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bạn chưa đặt mua sản phẩm nào.</p>
          <Link to="/shop" className="btn-primary">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-code">Đơn hàng #{order.orderCode}</span>
                  <span className="order-date">
                    Đặt ngày: {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className={`order-status ${order.status}`}>
                  {getStatusIcon(order.status)}
                  <span>{ORDER_STATUS[order.status]?.text}</span>
                </div>
              </div>

              <div className="order-items">
                {order.items?.slice(0, 3).map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-variant">
                        {item.size && `Size: ${item.size}`}
                        {item.color && `, Màu: ${item.color.name}`}
                      </p>
                      <p className="item-price">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="more-items">
                    + {order.items.length - 3} sản phẩm khác
                  </div>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Tổng cộng:</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
                <div className="order-actions">
                  <Link 
                    to={`/orders/${order._id}`} 
                    className="btn-view"
                  >
                    <FaEye /> Chi tiết
                  </Link>
                  {order.status === 'pending' && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;