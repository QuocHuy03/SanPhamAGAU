const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Category filter
    if (req.query.category) {
        // Resolve category slug to ID
        const categoryDoc = await Category.findOne({ slug: req.query.category });
        if (categoryDoc) {
            filter.category = categoryDoc._id;
        } else {
            // Check if it's already a valid ObjectId (fallback)
            if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
                filter.category = req.query.category;
            } else {
                // Return empty result if category not found
                return res.json({
                    status: 'success',
                    data: {
                        products: [],
                        pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
                    }
                });
            }
        }
    }

    // Brand filter
    if (req.query.brand) {
        filter.brand = req.query.brand;
    }

    // Status filter
    filter.status = req.query.status || 'active';

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search filter
    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { tags: { $in: [new RegExp(req.query.search, 'i')] } }
        ];
    }

    // Rating filter
    if (req.query.minRating) {
        filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Sort options
    let sort = {};
    switch (req.query.sortBy) {
        case 'price-asc':
            sort = { price: 1 };
            break;
        case 'price-desc':
            sort = { price: -1 };
            break;
        case 'rating':
            sort = { rating: -1 };
            break;
        case 'newest':
            sort = { createdAt: -1 };
            break;
        case 'popular':
            sort = { sold: -1 };
            break;
        default:
            sort = { createdAt: -1 };
    }

    const products = await Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
        status: 'success',
        data: {
            products,
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

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('reviews.user', 'name avatar');

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    res.json({
        status: 'success',
        data: {
            product
        }
    });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate('category', 'name slug')
        .populate('reviews.user', 'name avatar');

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    res.json({
        status: 'success',
        data: {
            product
        }
    });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ featured: true, status: 'active' })
        .populate('category', 'name slug')
        .limit(limit)
        .sort({ createdAt: -1 });

    res.json({
        status: 'success',
        data: {
            products
        }
    });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    const limit = parseInt(req.query.limit) || 4;

    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'active'
    })
        .populate('category', 'name slug')
        .limit(limit)
        .sort({ rating: -1, sold: -1 });

    res.json({
        status: 'success',
        data: {
            products: relatedProducts
        }
    });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        slug,
        description,
        price,
        discountPrice,
        category,
        brand,
        colors,
        sizes,
        stock,
        tags,
        specifications,
        sku,
        weight,
        dimensions,
        featured
    } = req.body;

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
        res.status(400);
        throw new Error('Slug đã tồn tại');
    }

    const product = await Product.create({
        name,
        slug,
        description,
        price,
        discountPrice,
        category,
        brand,
        colors,
        sizes,
        stock,
        tags,
        specifications,
        sku: sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        weight,
        dimensions,
        featured,
        status: 'active'
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo sản phẩm thành công',
        data: {
            product
        }
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    // Update fields
    const allowedFields = [
        'name', 'slug', 'description', 'price', 'discountPrice', 'category',
        'brand', 'colors', 'sizes', 'stock', 'tags', 'specifications',
        'sku', 'weight', 'dimensions', 'featured', 'status'
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            // Do not override sku to empty if already exists
            if (field === 'sku' && !req.body[field]) return;
            product[field] = req.body[field];
        }
    });

    const updatedProduct = await product.save();

    res.json({
        status: 'success',
        message: 'Cập nhật sản phẩm thành công',
        data: {
            product: updatedProduct
        }
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
        for (const image of product.images) {
            if (image.public_id) {
                try {
                    await cloudinary.uploader.destroy(image.public_id);
                } catch (error) {
                    console.error('Error deleting image from Cloudinary:', error);
                }
            }
        }
    }

    await product.deleteOne();

    res.json({
        status: 'success',
        message: 'Xóa sản phẩm thành công'
    });
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('Vui lòng chọn ảnh để upload');
    }

    const uploadedImages = [];
    const errors = [];

    // Upload all files concurrently to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
        try {
            // Convert buffer to base64
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'products',
                resource_type: 'auto'
            });

            return {
                url: result.secure_url,
                public_id: result.public_id
            };
        } catch (error) {
            console.error('Error uploading file to Cloudinary:', error);
            errors.push(error.message || 'Unknown Cloudinary Error');
            return null;
        }
    });

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);

    // Filter out failed uploads
    results.forEach(res => {
        if (res) uploadedImages.push(res);
    });

    if (errors.length > 0 && uploadedImages.length === 0) {
        res.status(500);
        throw new Error(`Cloudinary Upload Failed: ${errors.join(', ')}`);
    }

    // Add images to product
    product.images = [...(product.images || []), ...uploadedImages];
    await product.save();

    res.json({
        status: 'success',
        message: 'Upload ảnh thành công',
        data: {
            images: uploadedImages
        }
    });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        createdAt: Date.now()
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Calculate average rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
        status: 'success',
        message: 'Thêm đánh giá thành công',
        data: {
            review
        }
    });
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    const review = product.reviews.id(req.params.reviewId);

    if (!review) {
        res.status(404);
        throw new Error('Không tìm thấy đánh giá');
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Bạn không có quyền xóa đánh giá này');
    }

    product.reviews.pull(req.params.reviewId);
    product.numReviews = product.reviews.length;

    // Recalculate rating
    if (product.reviews.length > 0) {
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    } else {
        product.rating = 0;
    }

    await product.save();

    res.json({
        status: 'success',
        message: 'Xóa đánh giá thành công'
    });
});

// @desc    Get search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json({ status: 'success', data: { products: [] } });
    }

    const products = await Product.find({
        status: 'active',
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } }
        ]
    })
        .select('name price discountPrice images slug')
        .limit(5);

    res.json({
        status: 'success',
        data: {
            products
        }
    });
});

module.exports = {
    getProducts,
    getProductById,
    getProductBySlug,
    getFeaturedProducts,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    addProductReview,
    deleteProductReview,
    getSearchSuggestions
};
