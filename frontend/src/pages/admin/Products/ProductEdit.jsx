import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { adminService } from '../../../services/adminService';
import './ProductEdit.css';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAddMode = !id;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        brand: '',
        stock: '',
        status: 'active',
        featured: false,
        images: [] // placeholder for now
    });

    useEffect(() => {
        fetchCategories();
        if (!isAddMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const data = await adminService.getAllCategories();
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const product = await productService.getProductById(id);
            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                discountPrice: product.discountPrice || '',
                category: product.category?._id || product.category,
                brand: product.brand,
                stock: product.stock,
                status: product.status,
                featured: product.featured,
                images: product.images || []
            });
        } catch (error) {
            alert('Lỗi khi tải thông tin sản phẩm');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isAddMode) {
                await productService.createProduct(formData);
                alert('Tạo sản phẩm thành công!');
            } else {
                await productService.updateProduct(id, formData);
                alert('Cập nhật sản phẩm thành công!');
            }
            navigate('/admin/products');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isAddMode && !formData.name) return <div className="loading">Đang tải...</div>;

    return (
        <div className="product-edit-page">
            <div className="page-header">
                <h1>{isAddMode ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h1>
                <button onClick={() => navigate('/admin/products')} className="btn-back">
                    ⬅ Quay lại
                </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h3>Thông tin cơ bản</h3>
                        <div className="form-group">
                            <label>Tên sản phẩm *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug *</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Thương hiệu</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Danh mục *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="form-section">
                        <h3>Giá & Kho</h3>
                        <div className="form-group">
                            <label>Giá gốc (VND) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Giá khuyến mãi (VND)</label>
                            <input
                                type="number"
                                name="discountPrice"
                                value={formData.discountPrice}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số lượng tồn kho *</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group status-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                />
                                Sản phẩm nổi bật
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Mô tả chi tiết</label>
                    <textarea
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel">
                        Hủy bỏ
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang xử lý...' : (isAddMode ? 'Tạo sản phẩm' : 'Cập nhật')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
