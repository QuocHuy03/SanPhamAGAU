import React from 'react';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../utils/constants';

const ColorFilter = ({ selectedColors, onChange }) => {
  const { t } = useTranslation();
  const handleColorChange = (colorName) => {
    const newColors = selectedColors.includes(colorName)
      ? selectedColors.filter(c => c !== colorName)
      : [...selectedColors, colorName];

    onChange(newColors);
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
        {t('shop.colors')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => {
          const isActive = selectedColors.includes(color.name);
          return (
            <button
              key={color.name}
              className={`relative w-9 h-9 rounded-full border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 ${isActive ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-transparent shadow-sm'
                }`}
              onClick={() => handleColorChange(color.name)}
              style={{ backgroundColor: color.code }}
              title={color.name}
            >
              {isActive && (
                <span className={`flex items-center justify-center h-full w-full bg-black/10 rounded-full text-white text-[10px] font-bold`}>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorFilter;