import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import './Settings.css';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        siteName: 'ShopThoiTrang',
        email: 'admin@shopthoitrang.com',
        phone: '0123456789',
        address: 'Hanoi, Vietnam',
        currency: 'VND',
        shippingFee: 30000,
        freeShippingThreshold: 500000,
        defaultLanguage: 'vi'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const result = await adminService.getSettings();
            const settings = result?.data?.settings || result?.settings || result;
            if (settings) {
                setFormData(prev => ({ ...prev, ...settings }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'shippingFee' || name === 'freeShippingThreshold'
                ? Number(value)
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.updateSettings(formData);
            alert('✅ Lưu cài đặt thành công!');
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải cài đặt...</div>;

    return (
        <div className="admin-settings">
            <div className="page-header">
                <h1>Cài đặt hệ thống</h1>
            </div>

            <div className="settings-container">
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-section">
                        <h3>Thông tin chung</h3>
                        <div className="form-group">
                            <label>Tên cửa hàng</label>
                            <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Email nhận phản hồi</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại liên hệ</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Cấu hình bán hàng</h3>
                        <div className="form-group">
                            <label>Đơn vị tiền tệ</label>
                            <select name="currency" value={formData.currency} onChange={handleChange}>
                                <option value="VND">VND (₫ Việt Nam đồng)</option>
                                <option value="USD">USD ($ Đô la Mỹ)</option>
                                <option value="CNY">CNY (¥ Nhân dân tệ)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Phí vận chuyển mặc định (VND)</label>
                            <input
                                type="number"
                                name="shippingFee"
                                value={formData.shippingFee}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngưỡng miễn phí vận chuyển (VND)</label>
                            <input
                                type="number"
                                name="freeShippingThreshold"
                                value={formData.freeShippingThreshold}
                                onChange={handleChange}
                                min="0"
                            />
                            <small style={{ color: '#888', fontSize: 12 }}>
                                Đơn hàng trên mức này sẽ được miễn phí vận chuyển
                            </small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Ngôn ngữ mặc định</h3>
                        <div className="form-group">
                            <label>Ngôn ngữ hiển thị</label>
                            <select name="defaultLanguage" value={formData.defaultLanguage} onChange={handleChange}>
                                <option value="vi">🇻🇳 Tiếng Việt</option>
                                <option value="en">🇺🇸 English</option>
                                <option value="zh">🇨🇳 中文</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-save" disabled={saving}>
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
