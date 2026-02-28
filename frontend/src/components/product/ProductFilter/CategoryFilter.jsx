import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../../services/categoryService';

const CategoryFilter = ({ selectedCategories, onChange }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        if (response.status === 'success') {
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

  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    onChange(newCategories);
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
        {t('shop.categories')}
      </h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const isActive = selectedCategories.includes(category._id);
          return (
            <button
              key={category._id}
              onClick={() => handleCategoryChange(category._id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${isActive
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg opacity-80">{category.icon || '📁'}</span>
                <span>{category.name}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;