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
    <div className="filter-section">
      <h4>{t('shop.colors')}</h4>
      <div className="color-options">
        {COLORS.map((color) => (
          <button
            key={color.name}
            className={`color-option ${selectedColors.includes(color.name) ? 'selected' : ''}`}
            onClick={() => handleColorChange(color.name)}
            style={{ backgroundColor: color.code }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorFilter;