import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaStar, FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';
// import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    }));
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </Link>
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
            -{product.discount}%
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-colors z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300">
          <FaRegHeart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[3rem] group-hover:text-indigo-600 transition-colors">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="flex items-center text-sm">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-400">({product.reviewCount || 0})</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            {product.discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs line-through mb-0.5">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-indigo-600 font-black text-lg">
                  {formatCurrency(product.price * (1 - product.discount / 100))}
                </span>
              </div>
            ) : (
              <span className="text-gray-900 font-bold text-lg block">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors duration-300"
            onClick={handleAddToCart}
            title="Thêm vào giỏ"
          >
            <FaShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;