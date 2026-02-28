const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, amount } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Vui lòng cung cấp mã giảm giá');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        res.status(404);
        throw new Error('Mã giảm giá không tồn tại');
    }

    if (!coupon.isValid()) {
        res.status(400);
        throw new Error('Mã giảm giá đã hết hạn hoặc hết số lần sử dụng');
    }

    if (amount < coupon.minOrderAmount) {
        res.status(400);
        throw new Error(`Đơn hàng tối thiểu để sử dụng mã này là ${coupon.minOrderAmount}`);
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (amount * coupon.value) / 100;
    } else {
        discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed amount
    discountAmount = Math.min(discountAmount, amount);

    res.json({
        success: true,
        data: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount,
            finalAmount: amount - discountAmount
        }
    });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.json({
        success: true,
        count: coupons.length,
        data: coupons
    });
});

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const { code, type, value, minOrderAmount, expiryDate, usageLimit } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
        res.status(400);
        throw new Error('Mã giảm giá này đã tồn tại');
    }

    const coupon = await Coupon.create({
        code,
        type,
        value,
        minOrderAmount,
        expiryDate,
        usageLimit
    });

    res.status(201).json({
        success: true,
        data: coupon
    });
});

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá');
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: updatedCoupon
    });
});

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Không tìm thấy mã giảm giá');
    }

    await coupon.deleteOne();

    res.json({
        success: true,
        message: 'Đã xóa mã giảm giá thành công'
    });
});

module.exports = {
    validateCoupon,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
};
