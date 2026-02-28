import React from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from 'antd';

const PriceFilter = ({ priceRange, onChange }) => {
  const { t } = useTranslation();

  const handleSliderChange = (value) => {
    onChange(value);
  };

  return (
    <div className="filter-section">
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">{t('shop.price_range')}</h4>
      <div className="px-2">
        <Slider
          range
          min={0}
          max={1000000}
          step={10000}
          value={priceRange}
          onChange={handleSliderChange}
          trackStyle={[{ backgroundColor: '#6366f1' }]}
          handleStyle={[
            { borderColor: '#6366f1', backgroundColor: '#fff' },
            { borderColor: '#6366f1', backgroundColor: '#fff' }
          ]}
        />
      </div>
      <div className="price-range">
        <span>{priceRange[0].toLocaleString()}đ</span>
        <span>{priceRange[1].toLocaleString()}đ</span>
      </div>
    </div>
  );
};

export default PriceFilter;