const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAdminUsers,
  getAdminUserDetail,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  getAllOrders,
  getOrderDetail
} = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardSummary);
router.get('/stats', getDashboardSummary); // alias

// User management
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserDetail);
router.put('/users/:id', updateUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);

// Category management
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetail);
router.put('/orders/:id/status', updateOrderStatus);

// Settings management
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;