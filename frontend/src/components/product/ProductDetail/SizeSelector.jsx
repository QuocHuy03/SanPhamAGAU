import React from 'react';

const SizeSelector = ({ sizes, selectedSize, onSelectSize }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          className={`h-11 min-w-[3rem] px-4 rounded-xl border font-bold text-sm transition-all duration-200 ${selectedSize === size ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600'}`}
          onClick={() => onSelectSize(size)}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;