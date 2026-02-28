import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/helpers';
// import './Searchbar.css';

const SearchBar = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const response = await api.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
          if (response.status === 'success') {
            setSuggestions(response.data.products);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Search suggestions error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug) => {
    setQuery('');
    setShowSuggestions(false);
    navigate(`/product/slug/${slug}`);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form
        className="relative w-full flex items-center group"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder={t('common.search_placeholder', 'Tìm kiếm sản phẩm...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="w-full pl-5 pr-12 py-2.5 bg-gray-100/80 border border-transparent rounded-full text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 outline-none shadow-sm"
        />
        <div className="absolute right-1.5 flex items-center">
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
          <button
            type="submit"
            className="p-2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeInScale">
          {loading ? (
            <div className="p-4 text-center text-xs text-gray-400 font-black uppercase tracking-widest">Đang tìm kiếm...</div>
          ) : (
            <div className="py-2">
              {suggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSuggestionClick(product.slug || product._id)}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-4 transition-colors group/item"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img
                      src={product.images?.[0]?.url || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-gray-900 truncate group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-600">
                        {formatCurrency(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-[8px] text-gray-300 line-through font-bold">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div
                onClick={() => handleSearch()}
                className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-500 text-center uppercase tracking-widest hover:text-indigo-600 cursor-pointer transition-colors border-t border-gray-100"
              >
                Xem tất cả kết quả cho "{query}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;