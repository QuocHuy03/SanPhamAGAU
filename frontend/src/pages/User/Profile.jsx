import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { logout } from '../../store/slices/authSlice';
import './Profile.css';

const UserProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setFormData({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || ''
        });

        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getUserOrders();
            setOrders(response.data?.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await authService.updateProfile(formData);
            setIsEditing(false);
            alert('Cập nhật thông tin thành công!');
            // Reload user data logic here if needed
        } catch (error) {
            alert(error.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'confirmed': return 'blue';
            case 'processing': return 'purple';
            case 'shipping': return 'indigo';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                    <div className="profile-user-info">
                        <div className="profile-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2 className="profile-username">{user.name}</h2>
                        <p className="profile-email">{user.email}</p>
                        <div className="profile-role-badge">
                            {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                        </div>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Thông tin tài khoản
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Đơn hàng của tôi
                        </button>
                        <div className="nav-divider"></div>
                        <button className="nav-item logout" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="profile-content">
                    {activeTab === 'info' && (
                        <div className="content-card">
                            <div className="card-header">
                                <h3>Thông tin cá nhân</h3>
                                {!isEditing && (
                                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            <div className="card-body">
                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="profile-form">
                                        <div className="form-group">
                                            <label>Họ và tên</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Nhập họ tên của bạn"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số điện thoại</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Địa chỉ nhận hàng</label>
                                            <textarea
                                                rows="3"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Nhập địa chỉ giao hàng của bạn"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                                                Hủy bỏ
                                            </button>
                                            <button type="submit" className="btn-save">
                                                Lưu thay đổi
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="info-display">
                                        <div className="info-item">
                                            <span className="label">Họ tên</span>
                                            <span className="value">{user.name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Email</span>
                                            <span className="value">{user.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Số điện thoại</span>
                                            <span className="value">{user.phone || 'Chưa cập nhật'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Địa chỉ</span>
                                            <span className="value">{user.address || 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="content-card">
                            <div className="card-header">
                                <h3>Lịch sử đơn hàng</h3>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="loading-state">Đang tải đơn hàng...</div>
                                ) : orders.length === 0 ? (
                                    <div className="empty-state">
                                        <p>Bạn chưa có đơn hàng nào</p>
                                        <button onClick={() => navigate('/shop')} className="btn-shop-now">
                                            Mua sắm ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {orders.map((order) => (
                                            <div key={order._id} className="order-card">
                                                <div className="order-header">
                                                    <div className="order-id-group">
                                                        <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                                                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                                                        {order.status === 'pending' ? 'Chờ xử lý' :
                                                            order.status === 'confirmed' ? 'Đã xác nhận' :
                                                                order.status === 'shipping' ? 'Đang giao hàng' :
                                                                    order.status === 'delivered' ? 'Giao thành công' :
                                                                        order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                                    </span>
                                                </div>
                                                <div className="order-summary">
                                                    <div className="summary-row">
                                                        <span>Tổng tiền:</span>
                                                        <span className="total-amount">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                                        </span>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>Sản phẩm:</span>
                                                        <span className="item-count">{order.items?.length || 0} món</span>
                                                    </div>
                                                </div>
                                                <div className="order-actions">
                                                    <button className="btn-view-detail" onClick={() => navigate(`/order/${order._id}`)}>
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
