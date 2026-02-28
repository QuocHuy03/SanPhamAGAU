import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/helpers';
// import './Cart.css';


const Cart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, total, itemCount } = useSelector((state) => state.cart);

  const handleUpdateQuantity = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      dispatch(clearCart());
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <FaShoppingCart className="text-4xl text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">{t('cart.empty_title')}</h2>
        <p className="text-gray-500 mb-8 max-w-xs">{t('cart.empty_desc')}</p>
        <Link
          to="/shop"
          className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <FaArrowLeft className="mr-2" /> {t('common.continue_shopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{t('cart.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{t('orders.items')} ({itemCount})</h3>
              <button
                className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
                onClick={handleClearCart}
              >
                {t('cart.clear_all')}
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 group">
                  {/* Image */}
                  <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h4>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                      {item.size && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase">{t('product.size')}: {item.size}</span>}
                      {item.color && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase flex items-center gap-1">
                          {t('product.color')}: {item.color.name}
                          <span className="w-2 h-2 rounded-full border border-gray-300" style={{ backgroundColor: item.color.code }}></span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Quantity */}
                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center h-10 w-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-sm">
                        <button
                          className="flex-1 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors h-full"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <FaMinus className="w-2 h-2" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                        <button
                          className="flex-1 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors h-full"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <FaPlus className="w-2 h-2" />
                        </button>
                      </div>

                      <div className="text-right flex flex-col">
                        <span className="text-lg font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{formatCurrency(item.price)} / {t('orders.items').toLowerCase()}</span>
                      </div>
                    </div>

                    <button
                      className="text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors flex items-center sm:justify-end gap-1 px-2 py-1"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <FaTrash className="w-3 h-3" /> {t('profile.cancel')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-28">
            <h3 className="text-xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-100 uppercase tracking-tight">{t('checkout.order_summary')}</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>{t('cart.subtotal')}:</span>
                <span className="text-gray-900 font-bold">{formatCurrency(total)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{t('cart.shipping')}:</span>
                {total >= 500000 ? (
                  <span className="text-emerald-600 font-bold text-sm px-2 py-0.5 bg-emerald-50 rounded-full">{t('cart.free')}</span>
                ) : (
                  <span className="text-gray-900 font-bold">30.000đ</span>
                )}
              </div>

              {total < 500000 && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] leading-tight text-indigo-700 font-medium">
                    {t('cart.progress_notice', { amount: formatCurrency(500000 - total) })}
                  </p>
                  <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${(total / 500000) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-900 font-black text-lg">{t('cart.total')}:</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-indigo-600 tracking-tight block">
                    {formatCurrency(total >= 500000 ? total : total + 30000)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold italic">{t('cart.vat_notice')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to="/checkout"
                className="block w-full h-14 bg-indigo-600 text-white rounded-xl font-black text-center flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95"
              >
                {t('cart.checkout')}
              </Link>
              <Link
                to="/shop"
                className="block w-full py-3 text-sm font-bold text-gray-500 text-center hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="w-3 h-3" /> {t('common.continue_shopping')}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-2">
              {[
                { icon: '🚚', label: 'Ship nhanh' },
                { icon: '🔄', label: 'Đổi trả' },
                { icon: '🔒', label: 'Bảo mật' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;