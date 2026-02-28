import React from 'react';

const ColorSelector = ({ colors, selectedColor, onSelectColor }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selectedColor.name === color.name;
        return (
          <button
            key={color.name}
            className={`group relative w-12 h-12 rounded-full transition-all duration-500 flex items-center justify-center p-0.5 ${isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-4 shadow-xl shadow-indigo-100 -translate-y-1'
                : 'ring-1 ring-gray-100 hover:ring-indigo-200 hover:ring-offset-2 hover:-translate-y-1'
              }`}
            onClick={() => onSelectColor(color)}
            title={color.name}
          >
            <div
              className="w-full h-full rounded-full border border-black/5 flex items-center justify-center"
              style={{ backgroundColor: color.code }}
            >
              {isSelected && (
                <span className={`text-xs ${color.code.toLowerCase() === '#ffffff' || color.code.toLowerCase() === '#fff' ? 'text-gray-900' : 'text-white'} font-black filter drop-shadow-sm`}>
                  ✓
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ColorSelector;