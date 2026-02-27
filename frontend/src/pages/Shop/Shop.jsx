import { useTranslation } from 'react-i18next';
import ProductList from '../../components/product/ProductList/ProductList';
import ProductFilter from '../../components/product/ProductFilter/ProductFilter';
import Pagination from '../../components/product/ProductList/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { productService } from '../../services/productService';
// import './Shop.css';

const Shop = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    categories: [],
    sizes: [],
    colors: []
  });

  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const category = searchParams.get('category');
      const search = searchParams.get('search');

      let data;
      if (category) {
        data = await productService.getProductsByCategory(category);
      } else if (search) {
        data = await productService.searchProducts(search);
      } else {
        data = await productService.getAllProducts();
      }

      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by price
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1]
    );

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.categoryId)
      );
    }

    // Filter by sizes
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes.some(size => filters.sizes.includes(size))
      );
    }

    // Filter by colors
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors.some(color => filters.colors.includes(color.name))
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{t('shop.title')}</h1>
          <p className="text-gray-500 text-lg">
            {t('shop.description', { count: filteredProducts.length })}
          </p>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <ProductFilter onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Products Column */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm text-gray-600 font-medium">
                {t('shop.showing', {
                  start: startIndex + 1,
                  end: Math.min(startIndex + itemsPerPage, filteredProducts.length),
                  total: filteredProducts.length
                })}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{t('shop.sort_by')}:</span>
                <select className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-9 bg-gray-50 text-gray-700 font-medium cursor-pointer">
                  <option value="newest">{t('shop.sort_newest')}</option>
                  <option value="price-asc">{t('shop.sort_price_asc')}</option>
                  <option value="price-desc">{t('shop.sort_price_desc')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-12">
                <ProductList
                  products={currentProducts}
                  columns={3}
                  loading={loading}
                />

                {totalPages > 1 && (
                  <div className="flex justify-center border-t border-gray-200 pt-8 mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;