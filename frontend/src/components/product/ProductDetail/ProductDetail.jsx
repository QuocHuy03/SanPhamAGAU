import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { FaStar, FaShoppingCart, FaHeart, FaShareAlt, FaPlus, FaMinus } from 'react-icons/fa';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';
import ProductGallery from './ProductGallery';
import SizeSelector from './SizeSelector';
import ColorSelector from './ColorSelector';
// import './ProductDetail.css';

const ProductDetail = ({ product }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Redirect to cart page
    window.location.href = '/cart';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">

        {/* Left Side: Product Gallery */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <ProductGallery images={product.images} />
        </div>

        {/* Right Side: Product Info */}
        <div className="p-6 sm:p-8 lg:p-12 flex flex-col">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">{t('product.brand')}: {product.brand}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.inStock ? t('product.in_stock') : t('product.out_stock')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-400 border-l border-gray-200 pl-4">
                {product.rating || 5} ({product.reviewCount || 0} đánh giá)
              </span>
              <span className="text-sm font-medium text-gray-400 border-l border-gray-200 pl-4 space-x-1">
                <span className="text-gray-300">SKU:</span>
                <span className="text-gray-600">{product.sku}</span>
              </span>
            </div>
          </div>

          <div className="mb-8">
            {product.discountPrice ? (
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-black text-indigo-600 tracking-tight">
                  {formatCurrency(product.discountPrice)}
                </span>
                <div className="flex flex-col">
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs font-bold text-rose-500 uppercase">
                    {t('product.save')} {Math.round((1 - product.discountPrice / product.price) * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="space-y-8 flex-grow">
            {/* Description Summary */}
            <p className="text-gray-600 leading-relaxed text-base italic line-clamp-3">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('product.size')}</h3>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">{t('product.size_guide')}</button>
                </div>
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('product.color')}: <span className="text-indigo-600 font-medium">{selectedColor?.name}</span></h3>
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('product.quantity')}</h3>
              <div className="flex items-center h-12 w-32 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm focus-within:border-indigo-500 transition-colors">
                <button
                  className="flex-1 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors h-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 text-center bg-transparent font-bold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                />
                <button
                  className="flex-1 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white transition-colors h-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 space-y-4">
            <div className="flex gap-4">
              <button
                className="flex-[2] h-16 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transform active:scale-95 transition-all flex items-center justify-center space-x-3"
                onClick={handleAddToCart}
              >
                <FaShoppingCart className="w-6 h-6" />
                <span>{t('product.add_to_cart')}</span>
              </button>
              <button
                className="flex-1 h-16 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 transform active:scale-95 transition-all shadow-sm"
                onClick={handleBuyNow}
              >
                {t('product.buy_now')}
              </button>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 h-12 flex items-center justify-center space-x-2 text-sm font-bold text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-gray-100">
                <FaHeart className="w-4 h-4" />
                <span>{t('product.wishlist')}</span>
              </button>
              <button className="flex-1 h-12 flex items-center justify-center space-x-2 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100">
                <FaShareAlt className="w-4 h-4" />
                <span>{t('product.share')}</span>
              </button>
            </div>
          </div>

          {/* Social Proof / Features */}
          <div className="grid grid-cols-2 gap-4 mt-12 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚚</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('product.free_shipping')}</span>
                <span className="text-xs font-bold text-gray-700">{t('common.free_shipping_notice')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🛡️</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('product.quality_guarantee')}</span>
                <span className="text-xs font-bold text-gray-700">{t('common.return_policy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;