import React from 'react';

const ColorSelector = ({ colors, selectedColor, onSelectColor }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selectedColor.name === color.name;
        return (
          <button
            key={color.name}
            className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 flex items-center justify-center ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent shadow-sm'}`}
            onClick={() => onSelectColor(color)}
            style={{ backgroundColor: color.code }}
            title={color.name}
          >
            {isSelected && <span className={`text-xs ${color.code === '#ffffff' ? 'text-black' : 'text-white'} font-bold`}>✓</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ColorSelector;