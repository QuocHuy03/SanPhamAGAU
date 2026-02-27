import api from './api';

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// User Management
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserDetail = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response;
};

// Category Management
export const getAllCategories = async (params = {}) => {
  const response = await api.get('/admin/categories', { params });
  return response.data?.categories || [];
};

export const getCategoriesWithPagination = async (params = {}) => {
  const response = await api.get('/admin/categories', { params });
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/admin/categories', categoryData);
  return response;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/admin/categories/${id}`, categoryData);
  return response;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response;
};

// Order Management
export const getAllOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const getOrderDetail = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/admin/orders/${id}/status`, { status });
  return response.data;
};

// Settings Management
export const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await api.put('/admin/settings', data);
  return response.data;
};

// Export all as default object
const adminService = {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  getAllCategories,
  getCategoriesWithPagination,
  createCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  getAllOrders,
  getOrderDetail,
  getSettings,
  updateSettings
};

export { adminService };
export default adminService;