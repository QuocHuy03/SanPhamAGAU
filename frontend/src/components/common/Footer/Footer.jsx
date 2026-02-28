import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryService } from '../../../services/categoryService';

const Footer = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.status === 'success') {
          // Take only first 4 categories for footer
          setCategories(response.data.flatCategories?.slice(0, 4) || []);
        }
      } catch (error) {
        console.error('Error fetching categories in footer:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-gray-900 pt-16 pb-8 text-gray-300 font-sans border-t border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              STT.
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {t('common.footer_desc', 'Chuyên cung cấp quần áo thời trang chất lượng cao với phong cách hiện đại, thanh lịch.')}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="javascript:void(0)" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors duration-300">fb</a>
              <a href="javascript:void(0)" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors duration-300">ig</a>
              <a href="javascript:void(0)" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors duration-300">tw</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t('common.quick_links', 'Liên kết nhanh')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-indigo-400 transition-colors">{t('common.home', 'Trang chủ')}</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-indigo-400 transition-colors">{t('common.shop', 'Cửa hàng')}</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-indigo-400 transition-colors">{t('common.about', 'Về chúng tôi')}</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors">{t('common.contact', 'Liên hệ')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t('common.categories', 'Danh mục')}</h3>
            <ul className="space-y-3 text-sm">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link to={`/shop?category=${category.slug}`} className="text-gray-400 hover:text-indigo-400 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <>
                  <li><Link to="/shop?category=ao-thun" className="text-gray-400 hover:text-indigo-400 transition-colors">Áo thun</Link></li>
                  <li><Link to="/shop?category=ao-so-mi" className="text-gray-400 hover:text-indigo-400 transition-colors">Áo sơ mi</Link></li>
                  <li><Link to="/shop?category=quan-jean" className="text-gray-400 hover:text-indigo-400 transition-colors">Quần jean</Link></li>
                  <li><Link to="/shop?category=dam-vay" className="text-gray-400 hover:text-indigo-400 transition-colors">Đầm/Váy</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t('common.contact_info', 'Thông tin liên hệ')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-gray-400 text-sm">
                  123 Đường ABC, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center text-gray-400">
                0123 456 789
              </li>
              <li className="flex items-center text-gray-400">
                contact@shopthoitrang.com
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} STT. {t('common.rights', 'Tất cả quyền được bảo lưu.')}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="javascript:void(0)" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="javascript:void(0)" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;