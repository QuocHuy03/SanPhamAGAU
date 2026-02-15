import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllCategories();
            setCategories(data || []);
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editCategory) {
                await adminService.updateCategory(editCategory._id, formData);
                alert('Cập nhật danh mục thành công!');
            } else {
                await adminService.createCategory(formData);
                alert('Tạo danh mục thành công!');
            }

            setShowModal(false);
            setEditCategory(null);
            setFormData({ name: '', slug: '', description: '', image: '' });
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (category) => {
        setEditCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        try {
            await adminService.deleteCategory(id);
            alert('Xóa danh mục thành công!');
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    const handleAddNew = () => {
        setEditCategory(null);
        setFormData({ name: '', slug: '', description: '', image: '' });
        setShowModal(true);
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="admin-categories">
            <div className="page-header">
                <h1>Quản lý danh mục</h1>
                <button onClick={handleAddNew} className="btn-add">➕ Thêm danh mục</button>
            </div>

            <div className="categories-grid">
                {categories.map(cat => (
                    <div key={cat._id} className="category-card">
                        <div className="category-info">
                            <h3>{cat.name}</h3>
                            <p className="slug">/{cat.slug}</p>
                            {cat.description && <p className="desc">{cat.description}</p>}
                        </div>
                        <div className="category-actions">
                            <button onClick={() => handleEdit(cat)} className="btn-edit">✏️</button>
                            <button onClick={() => handleDelete(cat._id)} className="btn-delete">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="empty-state">Chưa có danh mục nào</div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên danh mục *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Slug *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>URL Hình ảnh</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editCategory ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
