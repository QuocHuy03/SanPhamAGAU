const express = require('express');
const router = express.Router();
const {
    validateCoupon,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public/Protected routes
router.post('/validate', protect, validateCoupon);

// Admin routes
router.use(protect);
router.use(admin);

router.get('/', getAllCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
