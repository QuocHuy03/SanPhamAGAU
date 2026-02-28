import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FaBars, FaTimes, FaRegHeart } from 'react-icons/fa';
// import './Header.css';
import CartIcon from './CartIcon';
import SearchBar from './SearchBar';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white shadow-sm py-4'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 transition-all duration-500">
              STT.
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile, flex on md+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-12">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-rose-500 transition-colors">
              <FaRegHeart className="text-xl" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce-short">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <CartIcon count={itemCount} />
            </Link>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ').pop()}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors">
                    {t('auth.admin_panel')}
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
                {t('auth.login')}
              </Link>
            )}

            <button
              className="sm:hidden p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Search - Visible only when menu is open or on small screens */}
        <div className="md:hidden mt-4">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-gray-100 pb-2 space-y-2">
            {!isAuthenticated && (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setIsMenuOpen(false)}>
                {t('auth.login_register')}
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setIsMenuOpen(false)}>
                {t('auth.my_account')}
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-700 bg-indigo-50" onClick={() => setIsMenuOpen(false)}>
                {t('auth.admin_panel')}
              </Link>
            )}
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;