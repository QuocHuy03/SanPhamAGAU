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
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
        {t('shop.sizes')}
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {SIZES.map((size) => {
          const isActive = selectedSizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`h-11 rounded-xl border-2 font-black text-xs transition-all duration-300 transform active:scale-90 ${isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeFilter;