const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        value: {
            type: Number,
            required: true
        },
        minOrderAmount: {
            type: Number,
            default: 0
        },
        expiryDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        usageLimit: {
            type: Number,
            default: null
        },
        usedCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.status === 'active' &&
        this.expiryDate > now &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
