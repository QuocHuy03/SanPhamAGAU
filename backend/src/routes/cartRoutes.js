const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    applyCoupon,
    removeCoupon
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth middleware - works for both guests and authenticated users
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization) {
        return protect(req, res, next);
    }
    next();
};

// Cart routes (work for both guests and authenticated users)
router.get('/', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/items/:itemId', optionalAuth, updateCartItem);
router.delete('/items/:itemId', optionalAuth, removeFromCart);
router.delete('/clear', optionalAuth, clearCart);
router.post('/apply-coupon', optionalAuth, applyCoupon);
router.delete('/remove-coupon', optionalAuth, removeCoupon);

// Authenticated user only
router.post('/sync', protect, syncCart);

module.exports = router;
