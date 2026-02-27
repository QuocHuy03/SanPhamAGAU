import React from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../../utils/constants';

const CategoryFilter = ({ selectedCategories, onChange }) => {
  const { t } = useTranslation();
  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    onChange(newCategories);
  };

  return (
    <div className="filter-section">
      <h4>{t('shop.categories')}</h4>
      <div className="filter-options">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="filter-option">
            <input
              type="checkbox"
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategoryChange(category.id)}
            />
            <label htmlFor={`category-${category.id}`}>
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;