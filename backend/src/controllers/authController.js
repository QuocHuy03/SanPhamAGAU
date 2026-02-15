const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const validator = require('validator');
const { sendPasswordResetCode } = require('../config/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validation
  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ thông tin');
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Email không hợp lệ');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (!/^\d{10,11}$/.test(phone)) {
    res.status(400);
    throw new Error('Số điện thoại không hợp lệ');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email đã được sử dụng');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user'
  });

  if (user) {
    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        token
      }
    });

    // Log registration
    console.log(`📝 New user registered: ${user.email} (${user.role})`);
  } else {
    res.status(400);
    throw new Error('Đăng ký thất bại');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Vui lòng nhập email và mật khẩu');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(401);
    throw new Error('Tài khoản đã bị khóa');
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  // Update login info
  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    status: 'success',
    message: 'Đăng nhập thành công',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      },
      token
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, dateOfBirth, gender } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }

  // Update fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (gender) user.gender = gender;

  const updatedUser = await user.save();

  res.json({
    status: 'success',
    message: 'Cập nhật thông tin thành công',
    data: {
      user: updatedUser
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }

  // Check current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Mật khẩu hiện tại không đúng');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    status: 'success',
    message: 'Đổi mật khẩu thành công'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    message: 'Đăng xuất thành công'
  });
});

// @desc    Request password reset code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Vui lòng nhập email');
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Email không hợp lệ');
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy tài khoản với email này');
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete any existing reset codes for this email
  await PasswordReset.deleteMany({ email });

  // Create new reset code
  await PasswordReset.create({ email, code });

  // Send email
  try {
    await sendPasswordResetCode(email, code);

    res.json({
      status: 'success',
      message: 'Mã xác nhận đã được gửi đến email của bạn'
    });
  } catch (error) {
    // Delete the code if email fails
    await PasswordReset.deleteMany({ email });
    res.status(500);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
});

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error('Vui lòng nhập email và mã xác nhận');
  }

  // Find reset code
  const resetCode = await PasswordReset.findOne({ email, code, used: false });

  if (!resetCode) {
    res.status(400);
    throw new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn');
  }

  res.json({
    status: 'success',
    message: 'Mã xác nhận hợp lệ'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ thông tin');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  // Find reset code
  const resetCode = await PasswordReset.findOne({ email, code, used: false });

  if (!resetCode) {
    res.status(400);
    throw new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn');
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy tài khoản');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Mark code as used
  resetCode.used = true;
  await resetCode.save();

  // Delete all reset codes for this email
  await PasswordReset.deleteMany({ email });

  res.json({
    status: 'success',
    message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword
};