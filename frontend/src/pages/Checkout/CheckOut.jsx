import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { orderService } from '../../services/orderService';
// import './CheckOut.css';

const CheckOut = () => {
  const { t } = useTranslation();
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
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{t('checkout.title')}</h1>
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 mt-4">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('cart.empty_title')}</h2>
        <p className="text-gray-500 mb-8 max-w-xs">{t('checkout.empty_desc')}</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          {t('orders.shop_now')}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{t('checkout.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Checkout Form */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">1</span>
              {t('checkout.delivery_info')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('checkout.fullname')} *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                    placeholder={t('profile.fullname')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('profile.email')} *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('checkout.phone')} *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                    placeholder="0123 456 789"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('checkout.city')} *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all bg-white"
                  >
                    <option value="">{t('checkout.select_city')}</option>
                    <option value="hcm">Hồ Chí Minh</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="danang">Đà Nẵng</option>
                    <option value="haiphong">Hải Phòng</option>
                    <option value="cantho">Cần Thơ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t('checkout.address')} *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                  placeholder="Số nhà, tên đường, phường/xã"
                />
              </div>

              <div className="pt-8 mt-8 border-t border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">2</span>
                  {t('checkout.payment_method')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'cod', label: t('checkout.methods.cod'), icon: '💵' },
                    { id: 'banking', label: t('checkout.methods.banking'), icon: '🏦' },
                    { id: 'momo', label: t('checkout.methods.momo'), icon: '📱' }
                  ].map((method) => (
                    <label key={method.id} className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === method.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-indigo-200'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-xs font-black text-center text-gray-900 uppercase tracking-tight">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-8 space-y-2">
                <label className="text-sm font-bold text-gray-700">{t('checkout.note')}</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all resize-none"
                  placeholder="Ví dụ: Giao hàng giờ hành chính..."
                />
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
                >
                  {loading ? t('checkout.processing') : t('checkout.place_order')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 text-gray-900 sticky top-28 border border-gray-100">
            <h2 className="text-xl font-black mb-10 uppercase tracking-tight border-b border-gray-50 pb-6 flex items-center justify-between">
              <span>{t('checkout.order_summary')}</span>
              <span className="text-sm font-bold text-gray-400">{items.length} {t('cart.items')}</span>
            </h2>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-10">
              {items.map(item => (
                <div key={item.id || item._id} className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={item.images?.[0]?.url || item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1 uppercase tracking-tight">{item.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase mt-1">
                      {item.size && <span>{item.size}</span>}
                      {item.color && <span>{item.color?.name || item.color}</span>}
                      <span className="text-indigo-600">x{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}đ</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-10 border-t border-gray-50">
              <div className="flex justify-between text-gray-500 text-sm font-bold uppercase tracking-tight">
                <span>{t('cart.subtotal')}</span>
                <span className="text-gray-900">{(calculateSubtotal()).toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-tight">
                <span className="text-gray-500">{t('cart.shipping')}</span>
                <span className={shippingFee === 0 ? 'text-emerald-500' : 'text-gray-900'}>
                  {shippingFee === 0 ? t('cart.free').toUpperCase() : `${shippingFee.toLocaleString()}đ`}
                </span>
              </div>

              <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                <span className="font-black text-lg text-gray-900 uppercase tracking-tight">{t('cart.total')}</span>
                <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                  {calculateTotal().toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckOut;
