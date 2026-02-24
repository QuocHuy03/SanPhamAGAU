import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { adminService } from '../../../services/adminService';
import './ProductEdit.css';

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
};

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAddMode = !id;
    const isMounted = useRef(true);

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

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
    });

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        fetchCategories();
        if (!isAddMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const data = await adminService.getAllCategories();
            if (isMounted.current) {
                setCategories(data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const product = await productService.getProductById(id);
            if (!isMounted.current) return;
            setFormData({
                name: product.name || '',
                slug: product.slug || '',
                description: product.description || '',
                price: product.price || '',
                discountPrice: product.discountPrice || '',
                category: product.category?._id || product.category || '',
                brand: product.brand || '',
                stock: product.stock || '',
                status: product.status || 'active',
                featured: product.featured || false,
            });
            setExistingImages(product.images || []);
        } catch (error) {
            if (isMounted.current) {
                alert('Lỗi khi tải thông tin sản phẩm');
                navigate('/admin/products');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            // Auto-generate slug from name only in add mode
            if (name === 'name' && isAddMode) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleRegenerateSlug = () => {
        setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setNewImageFiles(prev => [...prev, ...files]);
        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            let productId = id;

            if (isAddMode) {
                const response = await productService.createProduct(formData);
                productId = response?.data?.data?.product?._id || response?.data?.product?._id;
            } else {
                await productService.updateProduct(id, formData);
            }

            // Upload ảnh nếu có files mới
            if (newImageFiles.length > 0 && productId) {
                const imgFormData = new FormData();
                newImageFiles.forEach(file => imgFormData.append('images', file));
                try {
                    await productService.uploadImages(productId, imgFormData);
                } catch (imgError) {
                    console.error('Image upload error:', imgError);
                    alert('Sản phẩm đã lưu, nhưng một số ảnh upload thất bại.');
                }
            }

            if (isMounted.current) {
                const msg = isAddMode ? 'Tạo sản phẩm thành công!' : 'Cập nhật sản phẩm thành công!';
                alert(msg);
                navigate('/admin/products');
            }
        } catch (error) {
            if (isMounted.current) {
                alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
            }
        } finally {
            if (isMounted.current) setSubmitLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>;

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
                                placeholder="Nhập tên sản phẩm"
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Slug *</span>
                                <button
                                    type="button"
                                    onClick={handleRegenerateSlug}
                                    title="Tạo lại slug từ tên"
                                    style={{
                                        fontSize: '0.75rem', background: 'none',
                                        border: '1px solid #ccc', borderRadius: 4,
                                        padding: '2px 8px', cursor: 'pointer', color: '#555'
                                    }}
                                >
                                    🔄 Tạo lại từ tên
                                </button>
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                placeholder="ten-san-pham-theo-url"
                            />
                            <small style={{ color: '#888', fontSize: 12 }}>Tự động tạo khi thêm mới. Có thể chỉnh tay hoặc nhấn nút 🔄 để tạo lại.</small>
                        </div>
                        <div className="form-group">
                            <label>Thương hiệu</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Tên thương hiệu"
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
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="active">Đang bán</option>
                                <option value="inactive">Ngừng bán</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="form-section">
                        <h3>Giá & Kho hàng</h3>
                        <div className="form-group">
                            <label>Giá gốc (VND) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Giá khuyến mãi (VND)</label>
                            <input
                                type="number"
                                name="discountPrice"
                                value={formData.discountPrice}
                                onChange={handleChange}
                                min="0"
                                placeholder="Để trống nếu không giảm giá"
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
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group status-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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

                {/* Description */}
                <div className="form-group full-width">
                    <label>Mô tả chi tiết</label>
                    <textarea
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả chi tiết về sản phẩm..."
                    />
                </div>

                {/* Image Upload */}
                <div className="form-section full-width">
                    <h3>Ảnh sản phẩm</h3>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                        <div className="existing-images">
                            <p style={{ color: '#666', marginBottom: 10 }}>Ảnh hiện có:</p>
                            <div className="image-grid">
                                {existingImages.map((img, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img
                                            src={img.url || img}
                                            alt={`Ảnh ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New image previews */}
                    {imagePreviewUrls.length > 0 && (
                        <div className="new-images">
                            <p style={{ color: '#666', marginBottom: 10 }}>Ảnh sẽ được tải lên:</p>
                            <div className="image-grid">
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={url} alt={`Ảnh mới ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => removeNewImage(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="image-upload-area">
                        <label htmlFor="image-upload" className="image-upload-label">
                            <span>📷 Chọn ảnh (tối đa 5 ảnh)</span>
                            <small>Hỗ trợ: JPG, PNG, WebP</small>
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel">
                        Hủy bỏ
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitLoading}>
                        {submitLoading ? '⏳ Đang lưu...' : (isAddMode ? '✅ Tạo sản phẩm' : '✅ Cập nhật')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
