import api from './api';

export const productService = {
  // Get all products (returns array for legacy support)
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data?.products || [];
  },

  // Get products with full pagination data
  getProductsWithPagination: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data?.product;
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data?.product;
  },

  // Get products by category (using filter)
  getProductsByCategory: async (categorySlug) => {
    const response = await api.get('/products', { params: { category: categorySlug } });
    return response.data?.products || [];
  },

  // Search products
  searchProducts: async (query) => {
    const response = await api.get('/products', { params: { search: query } });
    return response.data?.products || [];
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data?.products || [];
  },

  // Get related products
  getRelatedProducts: async (id) => {
    const response = await api.get(`/products/${id}/related`);
    return response.data?.products || [];
  },

  // Admin: Create product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response;
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response;
  },

  // Admin: Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response;
  },

  // Admin: Upload images
  uploadImages: async (id, formData) => {
    const response = await api.post(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
};

export default productService;