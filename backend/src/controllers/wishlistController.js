const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
        path: 'products',
        select: 'name price discountPrice images stock status brand category'
    });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: req.user._id,
            products: []
        });
    }

    res.json({
        success: true,
        count: wishlist.products.length,
        data: wishlist.products
    });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Vui lòng cung cấp ID sản phẩm');
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: req.user._id,
            products: [productId]
        });
    } else {
        // Check if product already in wishlist
        if (wishlist.products.includes(productId)) {
            res.status(400);
            throw new Error('Sản phẩm đã có trong danh sách yêu thích');
        }

        wishlist.products.push(productId);
        await wishlist.save();
    }

    res.status(200).json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        count: wishlist.products.length
    });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        res.status(404);
        throw new Error('Không tìm thấy danh sách yêu thích');
    }

    wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
        success: true,
        message: 'Đã xóa khỏi danh sách yêu thích',
        count: wishlist.products.length
    });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
        wishlist.products = [];
        await wishlist.save();
    }

    res.status(200).json({
        success: true,
        message: 'Đã xóa toàn bộ danh sách yêu thích'
    });
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};
