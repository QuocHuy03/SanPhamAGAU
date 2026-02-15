const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sessionId: {
        type: String,
        default: null
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        size: String,
        color: String,
        image: String
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    coupon: {
        code: String,
        discount: Number,
        type: {
            type: String,
            enum: ['percentage', 'fixed']
        }
    },
    total: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
}, {
    timestamps: true
});

// Calculate totals before save
cartSchema.pre('save', function (next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Calculate total with coupon
    this.total = this.subtotal;
    if (this.coupon && this.coupon.discount) {
        if (this.coupon.type === 'percentage') {
            this.total = this.subtotal * (1 - this.coupon.discount / 100);
        } else {
            this.total = this.subtotal - this.coupon.discount;
        }
    }

    // Ensure total is not negative
    this.total = Math.max(0, this.total);

    next();
});

// TTL index - auto delete expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
