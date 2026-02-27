import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const CartIcon = ({ count }) => {
  return (
    <div className="relative inline-flex items-center justify-center">
      <FaShoppingCart className="text-xl sm:text-2xl" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-rose-500 border-2 border-white rounded-full shadow-sm animate-fadeIn">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export default CartIcon;