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
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
        <p className="text-gray-500 max-w-sm">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem thêm sản phẩm.</p>
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