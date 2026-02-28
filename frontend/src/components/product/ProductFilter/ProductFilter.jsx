import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PriceFilter from './PriceFilter';
import CategoryFilter from './CategoryFilter';
import SizeFilter from './SizeFilter';
import ColorFilter from './ColorFilter';
import './ProductFilter.css';

const ProductFilter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    categories: [],
    sizes: [],
    colors: []
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      categories: [],
      sizes: [],
      colors: []
    });
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
          <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3 shadow-[0_0_10px_rgba(79,70,229,0.3)]"></span>
          {t('shop.filters')}
        </h2>
        <button
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg"
          onClick={handleClearFilters}
        >
          {t('shop.clear_filters')}
        </button>
      </div>

      <PriceFilter
        priceRange={filters.priceRange}
        onChange={(range) => handleFilterChange('priceRange', range)}
      />

      <CategoryFilter
        selectedCategories={filters.categories}
        onChange={(categories) => handleFilterChange('categories', categories)}
      />

      <SizeFilter
        selectedSizes={filters.sizes}
        onChange={(sizes) => handleFilterChange('sizes', sizes)}
      />

      <ColorFilter
        selectedColors={filters.colors}
        onChange={(colors) => handleFilterChange('colors', colors)}
      />
    </div>
  );
};

export default ProductFilter;