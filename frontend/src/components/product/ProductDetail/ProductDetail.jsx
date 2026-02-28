import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { message } from 'antd';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';

import ProductGallery from './ProductGallery';
import SizeSelector from './SizeSelector';
import ColorSelector from './ColorSelector';
import ProductReviews from './ProductReviews';

const ProductDetail = ({ product }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Refined initial state for variants
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Sync state when product changes (useful if navigation happens within detail pages)
  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] || '');
    setSelectedColor(product?.colors?.[0] || null);
    setQuantity(1);
  }, [product?._id, product?.id, product?.sizes, product?.colors]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0]?.url || product.images?.[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    }));
    message.success(t('cart.add_success') || 'Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const onReviewAdded = () => {
    // Refresh page or trigger re-fetch from parent
    window.location.reload();
  };

  return (
    <div className="space-y-12">
      <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-white/40 ring-1 ring-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">
          {/* ... existing content ... */}
          {/* Left Side: Product Gallery */}
          <div className="p-4 sm:p-6 lg:p-12 lg:pr-6">
            <ProductGallery images={product.images || []} />
          </div>

          {/* Right Side: Product Info */}
          <div className="p-8 sm:p-10 lg:p-16 flex flex-col justify-center">
            {/* ... product info truncated for brevity but remains the same ... */}
            <div className="space-y-8">
              {/* Header: Brand & Status */}
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 rounded-2xl bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] border border-indigo-100/50 shadow-sm">
                  {product.brand}
                </span>
                <span className={`px-4 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm ${product.inStock
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                  : 'bg-rose-50 text-rose-600 border-rose-100/50'
                  }`}>
                  {product.inStock ? t('product.in_stock') : t('product.out_stock')}
                </span>
              </div>

              {/* Title & Rating */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center px-3 py-1 bg-amber-50 rounded-xl border border-amber-100/50">
                    <div className="flex items-center text-amber-500 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-amber-600">
                      {product.rating || 5.0}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-400 border-l-2 border-gray-100 pl-6">
                    {product.reviews?.length || 0} {t('product.rating')}
                  </span>
                  <span className="text-sm font-medium text-gray-300 border-l-2 border-gray-100 pl-6">
                    SKU: <span className="font-black text-gray-400">{product.sku}</span>
                  </span>
                </div>
              </div>

              {/* Price section */}
              <div className="py-6 border-y border-gray-100/80">
                {product.discountPrice ? (
                  <div className="flex items-end space-x-6">
                    <span className="text-5xl font-black text-indigo-600 tracking-tighter">
                      {formatCurrency(product.discountPrice)}
                    </span>
                    <div className="flex flex-col pb-1">
                      <span className="text-xl text-gray-300 line-through font-bold">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="mt-1 px-2 py-0.5 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-rose-200">
                        -{Math.round((1 - product.discountPrice / product.price) * 100)}% {t('product.save')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Options Selection */}
              <div className="space-y-10">
                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{t('product.color')}</h3>
                      <span className="text-sm font-black text-indigo-600">{selectedColor?.name}</span>
                    </div>
                    <ColorSelector
                      colors={product.colors}
                      selectedColor={selectedColor}
                      onSelectColor={setSelectedColor}
                    />
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{t('product.size')}</h3>
                      <button className="text-[12px] text-indigo-600 font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">
                        {t('product.size_guide')}
                      </button>
                    </div>
                    <SizeSelector
                      sizes={product.sizes}
                      selectedSize={selectedSize}
                      onSelectSize={setSelectedSize}
                    />
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-4">
                  <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{t('product.quantity')}</h3>
                  <div className="flex items-center w-40 h-16 rounded-[1.25rem] bg-gray-50 border border-gray-100 p-1 group transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-100">
                    <button
                      className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      className="flex-1 text-center bg-transparent font-black text-gray-900 focus:outline-none text-xl leading-none h-full"
                      readOnly
                    />
                    <button
                      className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 space-y-6">
                <div className="flex gap-4">
                  <button
                    className="flex-[2] h-20 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.4)] transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center space-x-4 group"
                    onClick={handleAddToCart}
                  >
                    <div className="bg-white/20 p-2.5 rounded-xl group-hover:bg-white/30 transition-colors">
                      <FaShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <span>{t('product.add_to_cart')}</span>
                  </button>
                  <button
                    className="flex-1 h-20 bg-white border-2 border-indigo-600 text-indigo-600 rounded-[1.5rem] font-black text-lg hover:bg-indigo-50 transform hover:-translate-y-1 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                    onClick={handleBuyNow}
                  >
                    {t('product.buy_now')}
                  </button>
                </div>
              </div>

              {/* Social Proof / Features */}
              <div className="grid grid-cols-2 gap-4 mt-12 bg-gray-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-white shadow-inner">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl border border-gray-50">🚚</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('product.free_shipping')}</span>
                    <span className="text-[12px] font-bold text-gray-600 leading-tight">{t('common.free_shipping_notice')}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl border border-gray-50">🛡️</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('product.quality_guarantee')}</span>
                    <span className="text-[12px] font-bold text-gray-600 leading-tight">{t('common.return_policy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <ProductReviews
        productId={product._id || product.id}
        reviews={product.reviews || []}
        rating={product.rating || 0}
        numReviews={product.reviews?.length || 0}
        onReviewAdded={onReviewAdded}
      />
    </div>
  );
};

export default ProductDetail;