const Settings = require('../models/Settings');
const asyncHandler = require('express-async-handler');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
    // Lấy settings (singleton - chỉ có 1 document)
    let settings = await Settings.findOne();

    // Nếu chưa có thì tạo mới với giá trị mặc định
    if (!settings) {
        settings = await Settings.create({});
    }

    res.json({
        status: 'success',
        data: { settings }
    });
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const allowedFields = ['siteName', 'email', 'phone', 'address', 'currency', 'shippingFee', 'defaultLanguage', 'freeShippingThreshold'];

    let settings = await Settings.findOne();

    if (!settings) {
        settings = new Settings();
    }

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            settings[field] = req.body[field];
        }
    });

    await settings.save();

    res.json({
        status: 'success',
        message: 'Lưu cài đặt thành công',
        data: { settings }
    });
});

module.exports = { getSettings, updateSettings };
