import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');

  const categories = [
    { id: 1, name: 'Áo thun', slug: 'ao-thun' },
    { id: 2, name: 'Áo sơ mi', slug: 'ao-so-mi' },
    { id: 3, name: 'Quần jean', slug: 'quan-jean' },
    { id: 4, name: 'Quần short', slug: 'quan-short' },
    { id: 5, name: 'Đầm/Váy', slug: 'dam-vay' },
    { id: 6, name: 'Áo khoác', slug: 'ao-khoac' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-[73px] z-40 hidden md:block">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-center space-x-8 overflow-x-auto py-3 hide-scrollbar">
          {categories.map((category) => {
            const isActive = currentCategory === category.slug;
            return (
              <li key={category.id} className="flex-shrink-0">
                <Link
                  to={`/shop?category=${category.slug}`}
                  className={`text-sm font-medium uppercase tracking-wide transition-all duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-gray-600'}`}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;