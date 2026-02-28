import React from 'react';

const SizeSelector = ({ sizes, selectedSize, onSelectSize }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          className={`group relative h-12 min-w-[3.5rem] px-6 rounded-2xl border-2 font-black text-sm transition-all duration-500 flex items-center justify-center overflow-hidden ${selectedSize === size
              ? 'border-indigo-600 text-white shadow-lg shadow-indigo-100 -translate-y-1'
              : 'border-gray-100 bg-white text-gray-500 hover:border-indigo-200 hover:text-indigo-600 hover:-translate-y-1'
            }`}
          onClick={() => onSelectSize(size)}
        >
          {selectedSize === size && (
            <div className="absolute inset-0 bg-indigo-600 transition-transform duration-500" />
          )}
          <span className="relative z-10">{size}</span>
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;