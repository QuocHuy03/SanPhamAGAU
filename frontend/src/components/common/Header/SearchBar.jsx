import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import './Searchbar.css';

const SearchBar = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form
      className="relative w-full flex items-center group"
      onSubmit={handleSearch}
    >
      <input
        type="text"
        placeholder={t('common.search_placeholder', 'Tìm kiếm sản phẩm...')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-5 pr-12 py-2.5 bg-gray-100/80 border border-transparent rounded-full text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 outline-none shadow-sm"
      />
      <button
        type="submit"
        className="absolute right-1.5 p-2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
      >
        <FaSearch className="w-4 h-4" />
      </button>
    </form>
  );
};

export default SearchBar;