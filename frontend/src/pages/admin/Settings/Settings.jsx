import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
    const [formData, setFormData] = useState({
        siteName: 'ShopThoiTrang',
        email: 'admin@shopthoitrang.com',
        phone: '0123456789',
        address: 'Hanoi, Vietnam',
        currency: 'VND',
        shippingFee: 30000
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call API to save settings (not implemented backend yet)
        alert('Lưu cài đặt thành công!');
    };

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
                            <input
                                type="text"
                                name="siteName"
                                value={formData.siteName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email liên hệ</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Cấu hình bán hàng</h3>
                        <div className="form-group">
                            <label>Đơn vị tiền tệ</label>
                            <select name="currency" value={formData.currency} onChange={handleChange}>
                                <option value="VND">VND</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Phí vận chuyển mặc định</label>
                            <input
                                type="number"
                                name="shippingFee"
                                value={formData.shippingFee}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-save">Lưu cài đặt</button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
