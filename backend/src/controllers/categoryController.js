const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ active: true })
        .populate('parent', 'name slug')
        .sort({ order: 1, name: 1 });

    // Build hierarchical structure
    const buildHierarchy = (categories, parentId = null) => {
        return categories
            .filter(cat => {
                if (parentId === null) {
                    return cat.parent === null || cat.parent === undefined;
                }
                return cat.parent && cat.parent._id.toString() === parentId.toString();
            })
            .map(cat => ({
                ...cat.toObject(),
                children: buildHierarchy(categories, cat._id)
            }));
    };

    const hierarchicalCategories = buildHierarchy(categories);

    res.json({
        status: 'success',
        data: {
            categories: hierarchicalCategories,
            flatCategories: categories // Also return flat list for convenience
        }
    });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
        .populate('parent', 'name slug');

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    // Get child categories
    const children = await Category.find({ parent: category._id, active: true })
        .sort({ order: 1, name: 1 });

    res.json({
        status: 'success',
        data: {
            category: {
                ...category.toObject(),
                children
            }
        }
    });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug, active: true })
        .populate('parent', 'name slug');

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    // Get child categories
    const children = await Category.find({ parent: category._id, active: true })
        .sort({ order: 1, name: 1 });

    res.json({
        status: 'success',
        data: {
            category: {
                ...category.toObject(),
                children
            }
        }
    });
});

// @desc    Get products by category
// @route   GET /api/categories/:slug/products
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug, active: true });

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    // Get all child categories
    const getAllChildIds = async (categoryId) => {
        const children = await Category.find({ parent: categoryId, active: true });
        let ids = [categoryId];

        for (const child of children) {
            const childIds = await getAllChildIds(child._id);
            ids = [...ids, ...childIds];
        }

        return ids;
    };

    const categoryIds = await getAllChildIds(category._id);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {
        category: { $in: categoryIds },
        status: 'active'
    };

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
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
            category,
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

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, description, image, parent, level, featured, order } = req.body;

    // Check if slug exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
        res.status(400);
        throw new Error('Slug đã tồn tại');
    }

    const category = await Category.create({
        name,
        slug,
        description,
        image,
        parent,
        level,
        featured,
        order,
        active: true
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo danh mục thành công',
        data: {
            category
        }
    });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    const allowedFields = ['name', 'slug', 'description', 'image', 'parent', 'level', 'featured', 'active', 'order'];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            category[field] = req.body[field];
        }
    });

    const updatedCategory = await category.save();

    res.json({
        status: 'success',
        message: 'Cập nhật danh mục thành công',
        data: {
            category: updatedCategory
        }
    });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
        res.status(400);
        throw new Error(`Không thể xóa danh mục đang có ${productsCount} sản phẩm`);
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: category._id });
    if (childrenCount > 0) {
        res.status(400);
        throw new Error(`Không thể xóa danh mục đang có ${childrenCount} danh mục con`);
    }

    await category.deleteOne();

    res.json({
        status: 'success',
        message: 'Xóa danh mục thành công'
    });
});

module.exports = {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    getProductsByCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
