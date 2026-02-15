const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getProductBySlug,
    getFeaturedProducts,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    addProductReview,
    deleteProductReview
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Protected routes (authenticated users)
router.post('/:id/reviews', protect, addProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/images', protect, admin, upload.array('images', 5), uploadProductImages);

module.exports = router;
