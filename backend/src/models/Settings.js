const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'ShopThoiTrang'
    },
    email: {
        type: String,
        default: 'admin@shopthoitrang.com'
    },
    phone: {
        type: String,
        default: '0123456789'
    },
    address: {
        type: String,
        default: 'Hanoi, Vietnam'
    },
    currency: {
        type: String,
        enum: ['VND', 'USD', 'CNY'],
        default: 'VND'
    },
    shippingFee: {
        type: Number,
        default: 30000
    },
    defaultLanguage: {
        type: String,
        enum: ['vi', 'en', 'zh'],
        default: 'vi'
    },
    freeShippingThreshold: {
        type: Number,
        default: 500000
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
