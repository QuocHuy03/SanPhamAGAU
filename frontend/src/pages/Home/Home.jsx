import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList/ProductList';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { productService } from '../../services/productService';
// import './Home.css';
import bannerImg from '../../assets/banner.jpg';
import saleBannerImg from '../../assets/sale-banner.jpg';
import denimImg from '../../assets/denim-collection.jpg';
import tetSaleImg from '../../assets/tet-sale.jpg';

const Home = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [featuredData, newData, bestData] = await Promise.all([
        productService.getFeaturedProducts(),
        productService.getNewArrivals(4),
        productService.getBestSellers(4)
      ]);
      setFeaturedProducts(featuredData);
      setNewArrivals(newData);
      setBestSellers(bestData);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="relative z-10 text-center md:text-left px-6 py-12 md:max-w-3xl md:mx-auto lg:ml-20 w-full">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-500/20 text-rose-400 text-sm font-bold tracking-wider mb-6 backdrop-blur-sm border border-rose-500/30">
            {t('home.hero.sale_badge')}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg">
            {t('home.hero.title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('home.hero.subtitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl mx-auto md:mx-0 drop-shadow-md">
            {t('home.hero.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link to="/shop" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:-translate-y-1">
              {t('home.hero.discover')}
            </Link>
            <Link to="/sale" className="px-8 py-4 bg-white/10 text-white font-bold rounded-full border border-white/30 backdrop-blur-md hover:bg-white/20 transition-all duration-300">
              {t('home.hero.collection')}
            </Link>
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      <section className="px-4 md:px-0">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url(${saleBannerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/80 mix-blend-multiply"></div>
          <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-8 md:mb-0 max-w-lg text-center md:text-left">
              <span className="inline-block py-1 px-3 bg-red-500/30 border border-red-500 rounded-full text-xs font-bold tracking-widest mb-4">{t('home.sale_banner.badge')}</span>
              <h2 className="text-3xl md:text-5xl font-black mb-4">{t('home.sale_banner.title')}</h2>
              <p className="text-lg text-red-100 font-medium">{t('home.sale_banner.desc')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 text-center min-w-[250px] shadow-xl">
              <div className="flex flex-col space-y-2 mb-6">
                <span className="text-gray-300 line-through text-lg">1.499.000đ</span>
                <span className="text-white text-4xl font-black text-shadow-md">749.000đ</span>
              </div>
              <Link to="/sale" className="block w-full py-3 bg-white text-red-600 font-bold rounded-full hover:bg-red-50 transition-colors shadow-lg">
                {t('home.sale_banner.buy_now')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="px-4 md:px-0">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('home.sections.featured')}</h2>
            <div className="mt-2 text-gray-500">{t('home.sections.featured_desc')}</div>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors group">
            {t('common.view_all')} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <ProductList products={featuredProducts} columns={4} />
      </section>

      {/* New Arrivals */}
      <section className="px-4 md:px-0">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('home.sections.new_arrivals')}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">New</span>
          </div>
        </div>
        <ProductList products={newArrivals} columns={4} />
      </section>

      {/* Best Sellers */}
      <section className="px-4 md:px-0 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-3xl shadow-inner">
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('home.sections.best_sellers')}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase">Hot</span>
          </div>
        </div>
        <ProductList products={bestSellers} columns={4} />
      </section>

      {/* Collection Banner */}
      <section className="px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div
            className="group relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-500 hover:-translate-y-2"
            style={{
              backgroundImage: `url(${denimImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent group-hover:from-indigo-900/90 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-wider mb-3">DENIM COLLECTION</span>
              <h3 className="text-3xl font-black text-white mb-2">{t('home.collections.denim_title')}</h3>
              <p className="text-gray-200 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{t('home.collections.denim_desc')}</p>
              <Link to="/shop?category=denim" className="inline-block px-6 py-2.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-md">
                {t('home.hero.discover')}
              </Link>
            </div>
          </div>

          <div
            className="group relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-500 hover:-translate-y-2"
            style={{
              backgroundImage: `url(${tetSaleImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-red-900 via-red-900/40 to-transparent group-hover:from-rose-600/90 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
              <span className="inline-block px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-wider mb-3">{t('home.hero.sale_badge')}</span>
              <h3 className="text-3xl font-black text-white mb-2">{t('home.collections.sale_title')}</h3>
              <p className="text-gray-200 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{t('home.collections.sale_desc')}</p>
              <Link to="/sale" className="inline-block px-6 py-2.5 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-md">
                {t('home.sale_banner.buy_now')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Extra space */}
      <div className="h-4"></div>

      {/* Features Banner */}
      <section className="px-4 md:px-0 bg-indigo-900 text-white rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="relative z-10 p-8 py-12 lg:p-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚚', title: t('home.features.free_ship'), desc: t('home.features.free_ship_desc') },
            { icon: '🔄', title: t('home.features.returns'), desc: t('home.features.returns_desc') },
            { icon: '💬', title: t('home.features.support'), desc: t('home.features.support_desc') },
            { icon: '🎁', title: t('home.features.gifts'), desc: t('home.features.gifts_desc') }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-white shadow-sm">{feature.title}</h3>
              <p className="text-indigo-200 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;