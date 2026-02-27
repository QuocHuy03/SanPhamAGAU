import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import './Orders.css';

const getStatusInfo = (status, t) => {
  const map = {
    pending: { text: t('orders.status.pending', 'Chờ xử lý'), className: 'status-pending' },
    confirmed: { text: t('orders.status.confirmed', 'Đã xác nhận'), className: 'status-confirmed' },
    processing: { text: t('orders.status.processing', 'Đang xử lý'), className: 'status-processing' },
    shipped: { text: t('orders.status.shipping', 'Đang giao hàng'), className: 'status-shipping' },
    delivered: { text: t('orders.status.delivered', 'Đã giao hàng'), className: 'status-delivered' },
    cancelled: { text: t('orders.status.cancelled', 'Đã hủy'), className: 'status-cancelled' }
  };
  return map[status] || { text: status, className: '' };
};

const PAYMENT_METHODS = {
  cod: 'Trả tiền khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay'
};

const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getMyOrders();
      setOrders(result?.orders || result?.data?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('orders.cancel_confirm', 'Bạn có chắc chắn muốn hủy đơn hàng này?'))) return;
    try {
      await orderService.cancelOrder(orderId);
      alert(t('orders.cancel_success', 'Đã hủy đơn hàng thành công!'));
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || t('orders.cancel_fail', 'Không thể hủy đơn hàng'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t('common.locale', 'vi-VN'), {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>{t('orders.title')}</h1>
        <div className="empty-orders">
          <h2>{t('orders.empty')}</h2>
          <p>{t('orders.empty_desc', 'Bạn chưa đặt đơn hàng nào. Hãy mua sắm ngay!')}</p>
          <button onClick={() => navigate('/shop')} className="btn-shop">
            {t('orders.shop_now')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>{t('orders.title')}</h1>

      <div className="orders-list">
        {orders.map(order => {
          const statusInfo = getStatusInfo(order.status, t);
          return (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">{t('orders.order_id', 'Mã đơn')}: #{order.orderNumber}</span>
                  <span className="order-date">{t('orders.order_date', 'Ngày đặt')}: {formatDate(order.createdAt)}</span>
                </div>
                <span className={`order-status ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="order-body">
                <div className="order-items">
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, marginRight: 10 }} />
                        )}
                        <div>
                          <span className="item-name">{item.name}</span>
                          <div>
                            {item.size && <span className="item-variant">{t('product.size')}: {item.size}</span>}
                            {item.color && <span className="item-variant"> | {t('product.color')}: {item.color}</span>}
                            <span className="item-quantity"> x{item.quantity}</span>
                          </div>
                        </div>
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
                  {t('orders.total')}: <span className="total-amount">{(order.total || 0).toLocaleString()}đ</span>
                </div>
                <div className="order-actions">
                  <button className="btn-detail" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>
                    {t('orders.view_detail')}
                  </button>
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button className="btn-cancel" onClick={() => handleCancelOrder(order._id)}>
                      {t('orders.cancel_order', 'Hủy đơn')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal chi tiết */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">{t('orders.detail_title', 'Chi tiết đơn hàng')} #{selectedOrder.orderNumber}</h2>

            <div className="order-detail-section">
              <h3>{t('checkout.delivery_info')}</h3>
              <div className="detail-row"><span className="detail-label">{t('checkout.fullname')}:</span>
                <span className="detail-value">{selectedOrder.shippingAddress?.fullName}</span></div>
              <div className="detail-row"><span className="detail-label">{t('checkout.phone')}:</span>
                <span className="detail-value">{selectedOrder.shippingAddress?.phone}</span></div>
              <div className="detail-row"><span className="detail-label">{t('checkout.address')}:</span>
                <span className="detail-value">{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</span></div>
            </div>

            <div className="order-detail-section">
              <h3>{t('checkout.payment_method')}</h3>
              <div className="detail-row"><span className="detail-label">{t('orders.method', 'Phương thức')}:</span>
                <span className="detail-value">{t(`checkout.methods.${selectedOrder.paymentMethod}`, selectedOrder.paymentMethod)}</span></div>
              {selectedOrder.note && (
                <div className="detail-row"><span className="detail-label">{t('checkout.note')}:</span>
                  <span className="detail-value">{selectedOrder.note}</span></div>
              )}
            </div>

            <div className="order-detail-section">
              <h3>{t('orders.items')} ({selectedOrder.items?.length} {t('orders.items')})</h3>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="order-item">
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                    <div>
                      <span className="item-name">{item.name}</span>
                      <div>
                        {item.size && <span className="item-variant">{t('product.size')}: {item.size}</span>}
                        {item.color && <span className="item-variant"> | {t('product.color')}: {item.color}</span>}
                        <span className="item-quantity"> x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <span className="item-price">{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
              <div style={{ marginTop: 15, borderTop: '2px solid #eee', paddingTop: 15 }}>
                <div className="detail-row"><span className="detail-label">{t('cart.subtotal')}:</span>
                  <span className="detail-value">{(selectedOrder.subtotal || 0).toLocaleString()}đ</span></div>
                <div className="detail-row"><span className="detail-label">{t('cart.shipping')}:</span>
                  <span className="detail-value">{selectedOrder.shippingFee === 0 ? t('cart.free') : `${(selectedOrder.shippingFee || 0).toLocaleString()}đ`}</span></div>
                <div className="detail-row" style={{ fontWeight: 600 }}>
                  <span className="detail-label">{t('cart.total')}:</span>
                  <span className="detail-value" style={{ color: '#4CAF50', fontSize: 18 }}>{(selectedOrder.total || 0).toLocaleString()}đ</span>
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