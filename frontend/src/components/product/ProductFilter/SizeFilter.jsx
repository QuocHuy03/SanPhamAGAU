import React from 'react';
import { useTranslation } from 'react-i18next';
import { SIZES } from '../../../utils/constants';

const SizeFilter = ({ selectedSizes, onChange }) => {
  const { t } = useTranslation();
  const handleSizeChange = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];

    onChange(newSizes);
  };

  return (
    <div className="filter-section">
      <h4>{t('shop.sizes')}</h4>
      <div className="size-options">
        {SIZES.map((size) => (
          <button
            key={size}
            className={`size-option ${selectedSizes.includes(size) ? 'selected' : ''}`}
            onClick={() => handleSizeChange(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeFilter;