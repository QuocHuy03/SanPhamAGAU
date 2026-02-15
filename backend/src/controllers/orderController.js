const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

// Configure email transporter (using env variables)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        shippingMethod,
        shippingFee,
        coupon,
        note
    } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('Giỏ hàng trống');
    }

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            res.status(404);
            throw new Error(`Không tìm thấy sản phẩm ${item.product}`);
        }

        if (product.status !== 'active') {
            res.status(400);
            throw new Error(`Sản phẩm ${product.name} không còn bán`);
        }

        if (product.stock < item.quantity) {
            res.status(400);
            throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`);
        }

        const price = product.discountPrice || product.price;
        subtotal += price * item.quantity;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: product.images && product.images.length > 0 ? product.images[0].url : ''
        });
    }

    // Calculate discount
    let discount = 0;
    if (coupon && coupon.code) {
        // TODO: Validate coupon from database when Coupon model is implemented
        discount = coupon.discount || 0;
    }

    // Calculate total
    const total = subtotal + (shippingFee || 0) - discount;

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        shippingMethod: shippingMethod || 'standard',
        shippingFee: shippingFee || 0,
        subtotal,
        discount,
        coupon,
        total,
        note,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
    });

    // Update product stock and sold count
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: {
                stock: -item.quantity,
                sold: item.quantity
            }
        });
    }

    // Clear user's cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Send order confirmation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: `Xác nhận đơn hàng #${order.orderNumber}`,
                html: `
          <h2>Cảm ơn bạn đã đặt hàng!</h2>
          <p>Mã đơn hàng: <strong>${order.orderNumber}</strong></p>
          <p>Tổng tiền: <strong>${total.toLocaleString('vi-VN')} VNĐ</strong></p>
          <p>Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
        `
            });
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    res.status(201).json({
        status: 'success',
        message: 'Đặt hàng thành công',
        data: {
            order
        }
    });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(total / limit);

    res.json({
        status: 'success',
        data: {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }
    });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name slug');

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Bạn không có quyền xem đơn hàng này');
    }

    res.json({
        status: 'success',
        data: {
            order
        }
    });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.paymentStatus) {
        filter.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.paymentMethod) {
        filter.paymentMethod = req.query.paymentMethod;
    }

    // Date range filter
    if (req.query.fromDate || req.query.toDate) {
        filter.createdAt = {};
        if (req.query.fromDate) filter.createdAt.$gte = new Date(req.query.fromDate);
        if (req.query.toDate) filter.createdAt.$lte = new Date(req.query.toDate);
    }

    const orders = await Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
        status: 'success',
        data: {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }
    });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Trạng thái không hợp lệ');
    }

    order.status = status;

    if (status === 'delivered') {
        order.deliveredAt = Date.now();
        order.paymentStatus = 'paid';
    }

    if (status === 'cancelled') {
        order.cancelledAt = Date.now();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: {
                    stock: item.quantity,
                    sold: -item.quantity
                }
            });
        }
    }

    await order.save();

    res.json({
        status: 'success',
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: {
            order
        }
    });
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { paymentStatus, transactionId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    order.paymentStatus = paymentStatus;

    if (transactionId) {
        order.paymentDetails = {
            transactionId,
            paymentDate: Date.now(),
            amount: order.total
        };
    }

    await order.save();

    res.json({
        status: 'success',
        message: 'Cập nhật trạng thái thanh toán thành công',
        data: {
            order
        }
    });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Bạn không có quyền hủy đơn hàng này');
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
        res.status(400);
        throw new Error('Đơn hàng không thể hủy ở trạng thái hiện tại');
    }

    order.status = 'cancelled';
    order.cancelledAt = Date.now();

    // Restore product stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: {
                stock: item.quantity,
                sold: -item.quantity
            }
        });
    }

    await order.save();

    res.json({
        status: 'success',
        message: 'Hủy đơn hàng thành công',
        data: {
            order
        }
    });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue stats
    const revenueResult = await Order.aggregate([
        {
            $match: { status: 'delivered' }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                averageOrderValue: { $avg: '$total' }
            }
        }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const averageOrderValue = revenueResult.length > 0 ? revenueResult[0].averageOrderValue : 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
        {
            $match: {
                status: 'delivered',
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                revenue: { $sum: '$total' },
                orderCount: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);

    res.json({
        status: 'success',
        data: {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue,
            averageOrderValue,
            monthlyRevenue
        }
    });
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    getOrderStats
};
