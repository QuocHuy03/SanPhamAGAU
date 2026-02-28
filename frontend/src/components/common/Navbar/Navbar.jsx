import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../../services/categoryService';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        if (response.status === 'success') {
          // Use flatCategories for simpler navigation
          setCategories(response.data.flatCategories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-[73px] z-40 hidden md:block">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-center space-x-8 overflow-x-auto py-3 hide-scrollbar">
          {categories.map((category) => {
            const isActive = currentCategory === category.slug;
            return (
              <li key={category._id} className="flex-shrink-0">
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