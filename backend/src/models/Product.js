const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: [0, 'Giá sản phẩm phải lớn hơn 0']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function (value) {
        return value < this.price;
      },
      message: 'Giá khuyến mãi phải nhỏ hơn giá gốc'
    }
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: String,
  images: [{
    url: String,
    public_id: String
  }],
  colors: [{
    name: String,
    code: String
  }],
  sizes: [String],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  tags: [String],
  specifications: [{
    key: String,
    value: String
  }],
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for inStock
productSchema.virtual('inStock').get(function () {
  return this.stock > 0 && this.status === 'active';
});

// Calculate discount percent before save
productSchema.pre('save', function (next) {
  if (this.discountPrice && this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

// Update timestamp
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search index

const Product = mongoose.model('Product', productSchema);

module.exports = Product;