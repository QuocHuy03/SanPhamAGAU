const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');

// @desc    Get admin dashboard summary
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardSummary = asyncHandler(async (req, res) => {
  // Count documents
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalCategories = await Category.countDocuments();

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
  const newOrdersToday = await Order.countDocuments({ createdAt: { $gte: today } });

  // Total revenue
  const revenueResult = await Order.aggregate([
    {
      $match: { status: 'delivered' }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' }
      }
    }
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // Monthly revenue
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const monthlyRevenueResult = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        createdAt: { $gte: currentMonth }
      }
    },
    {
      $group: {
        _id: null,
        monthlyRevenue: { $sum: '$total' }
      }
    }
  ]);

  const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].monthlyRevenue : 0;

  // Latest orders
  const latestOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  // Low stock products
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
    .sort({ stock: 1 })
    .limit(5)
    .select('name stock price');

  res.json({
    status: 'success',
    data: {
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        newUsersToday,
        newOrdersToday,
        totalRevenue,
        monthlyRevenue
      },
      latestOrders,
      lowStockProducts
    }
  });
});

// @desc    Get admin users page
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    filter.role = role;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter)
  ]);

  res.json({
    status: 'success',
    data: {
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get admin user detail
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getAdminUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate({
      path: 'orders',
      options: { sort: { createdAt: -1 } }
    })
    .populate('wishlist');

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }

  // Get user statistics
  const totalOrders = user.orders?.length || 0;
  const totalSpent = user.orders?.reduce((sum, order) => sum + order.total, 0) || 0;

  res.json({
    status: 'success',
    data: {
      user,
      statistics: {
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate: user.orders?.[0]?.createdAt || null
      }
    }
  });
});

// @desc    Update user by admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }

  const { name, email, phone, role, isActive, address } = req.body;

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (address) user.address = address;

  const updatedUser = await user.save();

  res.json({
    status: 'success',
    message: 'Cập nhật thông tin người dùng thành công',
    data: {
      user: updatedUser
    }
  });
});

// @desc    Delete user by admin
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }

  // Check if user has orders
  const hasOrders = await Order.exists({ user: user._id });

  if (hasOrders) {
    res.status(400);
    throw new Error('Không thể xóa người dùng đã có đơn hàng');
  }

  await user.deleteOne();

  res.json({
    status: 'success',
    message: 'Xóa người dùng thành công'
  });
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.json({
    status: 'success',
    data: { categories }
  });
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, parent, level } = req.body;

  if (!name || !slug) {
    res.status(400);
    throw new Error('Tên và slug là bắt buộc');
  }

  const categoryExists = await Category.findOne({ slug });
  if (categoryExists) {
    res.status(400);
    throw new Error('Slug đã tồn tại');
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    parent,
    level: level || 0
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo danh mục thành công',
    data: { category }
  });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }

  const { name, slug, description, image, parent, level, isFeatured } = req.body;

  if (name) category.name = name;
  if (slug) category.slug = slug;
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (parent !== undefined) category.parent = parent;
  if (level !== undefined) category.level = level;
  if (isFeatured !== undefined) category.isFeatured = isFeatured;

  await category.save();

  res.json({
    status: 'success',
    message: 'Cập nhật danh mục thành công',
    data: { category }
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Không tìm thấy danh mục');
  }

  const productsCount = await Product.countDocuments({ category: category._id });
  if (productsCount > 0) {
    res.status(400);
    throw new Error(`Không thể xóa danh mục có ${productsCount} sản phẩm`);
  }

  await category.deleteOne();

  res.json({
    status: 'success',
    message: 'Xóa danh mục thành công'
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status;
  const date = req.query.date;

  const keyword = req.query.keyword
    ? {
      orderNumber: {
        $regex: req.query.keyword,
        $options: 'i',
      },
    }
    : {};

  const filter = { ...keyword };
  if (status) {
    filter.status = status;
  }
  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(searchDate.getDate() + 1);
    filter.createdAt = {
      $gte: searchDate,
      $lt: nextDay
    };
  }

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'id name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    status: 'success',
    data: {
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    }
  });
});

// @desc    Get order detail
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name image price');

  if (order) {
    res.json({
      status: 'success',
      data: { order }
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Trạng thái không hợp lệ');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  order.status = status;
  await order.save();

  res.json({
    status: 'success',
    message: 'Cập nhật trạng thái đơn hàng thành công',
    data: { order }
  });
});

module.exports = {
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
};