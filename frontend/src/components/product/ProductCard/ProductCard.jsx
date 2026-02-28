import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaStar, FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';
import { message } from 'antd';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image,
      quantity: 1,
      color: selectedColor,
      size: selectedSize
    }));
    message.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <Link to={`/product/${product._id || product.id}`} className="block w-full h-full">
          <img
            src={product.images?.[0]?.url || product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </Link>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>

        {product.discount > 0 && (
          <span className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg z-10 uppercase tracking-widest">
            -{product.discount}%
          </span>
        )}

        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-rose-500 shadow-xl transition-all z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-500 flex items-center justify-center">
          <FaRegHeart className="w-4 h-4" />
        </button>

        {/* Quick Select Overlay (Simplified) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex flex-col gap-2">
            {/* Quick Sizes */}
            {product.sizes?.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {product.sizes.slice(0, 5).map(size => (
                  <button
                    key={size}
                    onClick={(e) => { e.preventDefault(); setSelectedSize(size); }}
                    className={`min-w-[30px] h-7 px-1 text-[9px] font-black rounded-lg transition-all border ${selectedSize === size
                        ? 'bg-white text-gray-900 border-white shadow-lg'
                        : 'bg-black/30 text-white border-white/20 hover:bg-black/50'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-black text-gray-900 leading-tight line-clamp-2 pr-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
              <Link to={`/product/${product._id || product.id}`}>{product.name}</Link>
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-2.5 h-2.5 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-bold">({product.reviewCount || 0})</span>
          </div>
        </div>

        {/* Color Selectors (Always visible but subtle) */}
        {product.colors?.length > 0 && (
          <div className="flex gap-2 mb-4">
            {product.colors.slice(0, 4).map(color => (
              <button
                key={typeof color === 'string' ? color : color.name}
                onClick={() => setSelectedColor(color)}
                className={`w-4 h-4 rounded-full border-2 transition-all p-0.5 ${(typeof selectedColor === 'string' ? selectedColor === color : selectedColor?.name === color.name)
                    ? 'border-indigo-600 scale-125 shadow-md'
                    : 'border-transparent hover:scale-110'
                  }`}
                title={typeof color === 'string' ? color : color.name}
              >
                <div
                  className="w-full h-full rounded-full shadow-inner"
                  style={{ backgroundColor: typeof color === 'string' ? color : color.code }}
                />
              </button>
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400 font-black self-center">+{product.colors.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-gray-400 text-[10px] font-bold line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-indigo-600 font-black text-lg tracking-tighter">
                  {formatCurrency(product.price * (1 - product.discount / 100))}
                </span>
              </>
            ) : (
              <span className="text-gray-900 font-black text-lg tracking-tighter">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm active:scale-95 group/btn overflow-hidden relative"
            onClick={handleAddToCart}
            title="Thêm vào giỏ"
          >
            <FaShoppingCart className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
