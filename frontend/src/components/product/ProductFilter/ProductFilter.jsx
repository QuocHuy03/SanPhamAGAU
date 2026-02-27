import { useTranslation } from 'react-i18next';
import PriceFilter from './PriceFilter';
import CategoryFilter from './CategoryFilter';
import SizeFilter from './SizeFilter';
import ColorFilter from './ColorFilter';
import './ProductFilter.css';

const ProductFilter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    categories: [],
    sizes: [],
    colors: []
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 1000000],
      categories: [],
      sizes: [],
      colors: []
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="product-filter">
      <div className="filter-header">
        <h3>{t('shop.filter_title')}</h3>
        <button className="clear-filters" onClick={handleClearFilters}>
          {t('shop.clear_filters')}
        </button>
      </div>

      <PriceFilter
        priceRange={filters.priceRange}
        onChange={(range) => handleFilterChange('priceRange', range)}
      />

      <CategoryFilter
        selectedCategories={filters.categories}
        onChange={(categories) => handleFilterChange('categories', categories)}
      />

      <SizeFilter
        selectedSizes={filters.sizes}
        onChange={(sizes) => handleFilterChange('sizes', sizes)}
      />

      <ColorFilter
        selectedColors={filters.colors}
        onChange={(colors) => handleFilterChange('colors', colors)}
      />
    </div>
  );
};

export default ProductFilter;