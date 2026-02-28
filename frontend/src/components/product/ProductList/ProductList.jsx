import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
// import './ProductList.css';

const ProductList = ({ products, loading, columns = 4 }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm animate-fadeIn">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
          <span className="text-5xl grayscale opacity-50">🔍</span>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3">Không tìm thấy sản phẩm nào</h3>
        <p className="text-gray-500 max-w-sm leading-relaxed mb-8">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn để khám phá những bộ sưu tập tuyệt vời khác.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95"
        >
          Làm mới bộ lọc
        </button>
      </div>
    );
  }

  // Determine grid columns based on prop
  const getGridClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid gap-6 sm:gap-8 ${getGridClass()}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;