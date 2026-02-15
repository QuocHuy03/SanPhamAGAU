const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// Helper function to get or create cart
const getOrCreateCart = async (userId, sessionId) => {
    let cart;

    if (userId) {
        cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price discountPrice images stock status');
    } else if (sessionId) {
        cart = await Cart.findOne({ sessionId }).populate('items.product', 'name price discountPrice images stock status');
    }

    if (!cart) {
        cart = await Cart.create({
            user: userId || null,
            sessionId: sessionId || null,
            items: []
        });
    }

    return cart;
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Public/Private
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    res.json({
        status: 'success',
        data: {
            cart
        }
    });
});

// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Public/Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    if (!productId) {
        res.status(400);
        throw new Error('Vui lòng chọn sản phẩm');
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    if (product.status !== 'active') {
        res.status(400);
        throw new Error('Sản phẩm không còn bán');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm`);
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
        item => item.product._id.toString() === productId &&
            item.size === size &&
            item.color === color
    );

    if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;

        // Check stock
        if (cart.items[existingItemIndex].quantity > product.stock) {
            res.status(400);
            throw new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm`);
        }
    } else {
        // Add new item
        cart.items.push({
            product: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            quantity,
            size,
            color,
            image: product.images && product.images.length > 0 ? product.images[0].url : ''
        });
    }

    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock status');

    res.json({
        status: 'success',
        message: 'Thêm vào giỏ hàng thành công',
        data: {
            cart
        }
    });
});

// @desc    Update cart item
// @route   PUT /api/cart/items/:itemId
// @access  Public/Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Số lượng không hợp lệ');
    }

    const cart = await getOrCreateCart(userId, sessionId);

    const item = cart.items.id(req.params.itemId);

    if (!item) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (quantity > product.stock) {
        res.status(400);
        throw new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm`);
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock status');

    res.json({
        status: 'success',
        message: 'Cập nhật giỏ hàng thành công',
        data: {
            cart
        }
    });
});

// @desc    Remove from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Public/Private
const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    const item = cart.items.id(req.params.itemId);

    if (!item) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock status');

    res.json({
        status: 'success',
        message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        data: {
            cart
        }
    });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Public/Private
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    cart.items = [];
    cart.coupon = undefined;
    await cart.save();

    res.json({
        status: 'success',
        message: 'Đã xóa toàn bộ giỏ hàng',
        data: {
            cart
        }
    });
});

// @desc    Sync cart (merge localStorage cart to database)
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!req.user) {
        res.status(401);
        throw new Error('Vui lòng đăng nhập');
    }

    const cart = await getOrCreateCart(req.user._id, null);

    // Merge items from localStorage
    for (const localItem of items) {
        const product = await Product.findById(localItem.product || localItem.productId);

        if (!product || product.status !== 'active') continue;

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === product._id.toString() &&
                item.size === localItem.size &&
                item.color === localItem.color
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += localItem.quantity;

            // Don't exceed stock
            if (cart.items[existingItemIndex].quantity > product.stock) {
                cart.items[existingItemIndex].quantity = product.stock;
            }
        } else {
            // Add new item
            cart.items.push({
                product: product._id,
                name: product.name,
                price: product.discountPrice || product.price,
                quantity: Math.min(localItem.quantity, product.stock),
                size: localItem.size,
                color: localItem.color,
                image: product.images && product.images.length > 0 ? product.images[0].url : ''
            });
        }
    }

    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock status');

    res.json({
        status: 'success',
        message: 'Đồng bộ giỏ hàng thành công',
        data: {
            cart
        }
    });
});

// @desc    Apply coupon
// @route   POST /api/cart/apply-coupon
// @access  Public/Private
const applyCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    if (!code) {
        res.status(400);
        throw new Error('Vui lòng nhập mã giảm giá');
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // TODO: Validate coupon from database when Coupon model is implemented
    // For now, accept some demo coupons
    const demoCoupons = {
        'WELCOME10': { discount: 10, type: 'percentage' },
        'SAVE20': { discount: 20, type: 'percentage' },
        'FREESHIP': { discount: 30000, type: 'fixed' }
    };

    const coupon = demoCoupons[code.toUpperCase()];

    if (!coupon) {
        res.status(400);
        throw new Error('Mã giảm giá không hợp lệ');
    }

    cart.coupon = {
        code: code.toUpperCase(),
        discount: coupon.discount,
        type: coupon.type
    };

    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock status');

    res.json({
        status: 'success',
        message: 'Áp dụng mã giảm giá thành công',
        data: {
            cart
        }
    });
});

// @desc    Remove coupon
// @route   DELETE /api/cart/remove-coupon
// @access  Public/Private
const removeCoupon = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    cart.coupon = undefined;
    await cart.save();
    await cart.populate('items.product', 'name price discountPrice images stock status');

    res.json({
        status: 'success',
        message: 'Đã xóa mã giảm giá',
        data: {
            cart
        }
    });
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
    applyCoupon,
    removeCoupon
};
