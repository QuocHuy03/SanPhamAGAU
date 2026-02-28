import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { FaBox, FaCalendarAlt, FaChevronRight, FaTimes, FaMapMarkerAlt, FaCreditCard, FaRegStickyNote, FaTrashAlt } from 'react-icons/fa';

const getStatusInfo = (status, t) => {
  const map = {
    pending: {
      text: t('orders.status.pending', 'Chờ xử lý'),
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    confirmed: {
      text: t('orders.status.confirmed', 'Đã xác nhận'),
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    processing: {
      text: t('orders.status.processing', 'Đang xử lý'),
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    shipped: {
      text: t('orders.status.shipping', 'Đang giao'),
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    delivered: {
      text: t('orders.status.delivered', 'Đã giao'),
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    cancelled: {
      text: t('orders.status.cancelled', 'Đã hủy'),
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    }
  };
  return map[status] || { text: status, color: 'bg-gray-50 text-gray-600 border-gray-200' };
};

const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
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
  }, [isAuthenticated, navigate]);

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
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-12 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <FaBox className="text-4xl text-gray-300" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{t('orders.empty', 'Bạn chưa có đơn hàng nào')}</h1>
          <p className="text-gray-500 mb-10 leading-relaxed font-medium">{t('orders.empty_desc', 'Hãy bắt đầu trải nghiệm mua sắm cùng chúng tôi để sở hữu những sản phẩm tuyệt vời nhất!')}</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest text-sm"
          >
            {t('orders.shop_now')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
            {t('orders.title', 'Đơn hàng của tôi')}
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            {orders.length} {t('cart.items')} {t('orders.total_title', 'đã đặt')}
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 transition-colors flex items-center gap-2"
        >
          {t('orders.shop_now')} <FaChevronRight className="text-[10px]" />
        </button>
      </div>

      <div className="space-y-6">
        {orders.map(order => {
          const statusInfo = getStatusInfo(order.status, t);
          return (
            <div key={order._id} className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-gray-200 group overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Header Info */}
                  <div className="lg:w-1/4 flex flex-col gap-4 border-r border-gray-50 pr-8">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('orders.order_id', 'Mã đơn')}</span>
                      <span className="text-sm font-black text-gray-900 tracking-tight">#{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('orders.order_date', 'Ngày đặt')}</span>
                      <div className="flex items-center gap-2 text-gray-600 font-bold text-xs tracking-tight">
                        <FaCalendarAlt className="text-[10px] text-gray-300" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border self-start ${statusInfo.color}`}>
                      {statusInfo.text}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:w-1/2 space-y-4 max-h-[160px] overflow-y-auto pr-4 custom-scrollbar">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center group/item">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm transition-transform duration-300 group-hover/item:scale-105">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-black text-gray-800 line-clamp-1 uppercase tracking-tight group-hover/item:text-indigo-600 transition-colors uppercase leading-none mb-1">{item.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            {item.size && <span>{item.size}</span>}
                            {item.color && <span> | {item.color}</span>}
                            <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md ml-auto">x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Actions */}
                  <div className="lg:w-1/4 flex flex-col justify-between items-end border-l border-gray-50 pl-8 text-right">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('orders.total')}</span>
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">{(order.total || 0).toLocaleString()}đ</span>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button
                        className="flex-1 h-12 bg-gray-50 text-gray-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-gray-100 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                      >
                        {t('orders.view_detail', 'Chi tiết')}
                      </button>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button
                          className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                          onClick={() => handleCancelOrder(order._id)}
                          title={t('orders.cancel_order')}
                        >
                          <FaTrashAlt className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white animate-fadeIn" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">
                  {t('orders.detail_title', 'Đơn hàng')} #{selectedOrder.orderNumber}
                </h2>
                <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusInfo(selectedOrder.status, t).color}`}>
                  {getStatusInfo(selectedOrder.status, t).text}
                </div>
              </div>
              <button
                className="w-12 h-12 rounded-2xl bg-white text-gray-400 flex items-center justify-center hover:text-gray-900 hover:shadow-lg transition-all border border-gray-100"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Shipping Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt /> {t('checkout.delivery_info')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{t('checkout.fullname')}</span>
                        <p className="text-sm font-bold text-gray-800">{selectedOrder.shippingAddress?.fullName}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{t('checkout.phone')}</span>
                        <p className="text-sm font-bold text-gray-800">{selectedOrder.shippingAddress?.phone}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{t('checkout.address')}</span>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed">
                          {selectedOrder.shippingAddress?.street}<br />
                          {selectedOrder.shippingAddress?.ward && `${selectedOrder.shippingAddress.ward}, `}
                          {selectedOrder.shippingAddress?.district && `${selectedOrder.shippingAddress.district}, `}
                          {selectedOrder.shippingAddress?.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Note */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <FaCreditCard /> {t('checkout.payment_method')}
                    </h3>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{t('orders.method', 'Phương thức')}</span>
                      <p className="text-sm font-bold text-gray-800 uppercase tracking-tighter">
                        {t(`checkout.methods.${selectedOrder.paymentMethod}`, selectedOrder.paymentMethod)}
                      </p>
                    </div>
                  </div>

                  {selectedOrder.note && (
                    <div>
                      <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <FaRegStickyNote /> {t('checkout.note')}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100 italic leading-relaxed">
                        "{selectedOrder.note}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-12">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                  <span>{t('orders.items')} ({selectedOrder.items?.length})</span>
                  <span className="text-gray-400">{t('orders.total').toUpperCase()}</span>
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center p-3 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-tight line-clamp-1 mb-1">{item.name}</h4>
                        <div className="flex gap-3 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                          {item.size && <span>{item.size}</span>}
                          {item.color && <span>{item.color}</span>}
                          <span className="text-indigo-500">x{item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-gray-900 tracking-tighter">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <span>{t('cart.subtotal')}</span>
                  <span className="text-gray-900">{(selectedOrder.subtotal || 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <span>{t('cart.shipping')}</span>
                  <span className={selectedOrder.shippingFee === 0 ? 'text-emerald-500' : 'text-gray-900'}>
                    {selectedOrder.shippingFee === 0 ? t('cart.free').toUpperCase() : `${(selectedOrder.shippingFee || 0).toLocaleString()}đ`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <span className="font-black text-lg text-gray-900 uppercase tracking-tight">{t('cart.total')}</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                    {(selectedOrder.total || 0).toLocaleString()}đ
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