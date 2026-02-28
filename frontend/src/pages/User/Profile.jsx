import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { logout } from '../../store/slices/authSlice';
import {
    UserOutlined,
    ShoppingOutlined,
    LogoutOutlined,
    EditOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CarOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
// Remove custom CSS import
// import './Profile.css';

const UserProfile = () => {
    const { t } = useTranslation();
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
            alert(t('profile.update_success'));
            // Reload user data logic here if needed
        } catch (error) {
            alert(error.response?.data?.message || t('profile.update_fail'));
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { color: 'text-orange-600 bg-orange-100', icon: <ClockCircleOutlined />, label: t('orders.status.pending') };
            case 'confirmed': return { color: 'text-blue-600 bg-blue-100', icon: <InfoCircleOutlined />, label: t('orders.status.confirmed') };
            case 'shipping': return { color: 'text-indigo-600 bg-indigo-100', icon: <CarOutlined />, label: t('orders.status.shipping') };
            case 'delivered': return { color: 'text-emerald-600 bg-emerald-100', icon: <CheckCircleOutlined />, label: t('orders.status.delivered') };
            case 'cancelled': return { color: 'text-rose-600 bg-rose-100', icon: <CloseCircleOutlined />, label: t('orders.status.cancelled') };
            default: return { color: 'text-gray-600 bg-gray-100', icon: <InfoCircleOutlined />, label: status };
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-80 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 bg-cover bg-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                {user.role === 'admin' ? t('profile.role_admin') : t('profile.role_user')}
                            </span>
                        </div>
                    </div>

                    <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <button
                            className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-colors duration-150 ${activeTab === 'info' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <UserOutlined className="mr-3 text-lg" />
                            {t('profile.nav_account')}
                        </button>
                        <button
                            className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-colors duration-150 border-t border-gray-100 ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingOutlined className="mr-3 text-lg" />
                            {t('profile.nav_orders')}
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button
                            className="w-full flex items-center px-6 py-4 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors duration-150"
                            onClick={handleLogout}
                        >
                            <LogoutOutlined className="mr-3 text-lg" />
                            {t('profile.nav_logout')}
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">{t('profile.title')}</h3>
                                {!isEditing && (
                                    <button
                                        className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <EditOutlined className="mr-2" />
                                        {t('profile.edit')}
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.fullname')}</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                                                    placeholder={t('profile.placeholder_name', 'John Doe')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.phone')}</label>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                                                    placeholder={t('profile.placeholder_phone', '+84 123 456 789')}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.address')}</label>
                                            <textarea
                                                rows="3"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none"
                                                placeholder={t('profile.placeholder_address', '123 Example Street, City')}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-50">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                {t('profile.cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
                                            >
                                                {t('profile.save')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">{t('profile.fullname')}</p>
                                            <p className="text-base font-semibold text-gray-900">{user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">{t('profile.email')}</p>
                                            <p className="text-base font-semibold text-gray-900">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-1">{t('profile.phone')}</p>
                                            <p className="text-base font-semibold text-gray-900">{user.phone || <span className="text-gray-400 italic">{t('profile.not_updated')}</span>}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-medium text-gray-500 mb-1">{t('profile.address')}</p>
                                            <p className="text-base font-semibold text-gray-900">{user.address || <span className="text-gray-400 italic">{t('profile.not_updated')}</span>}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">{t('orders.title')}</h3>
                            </div>
                            <div className="p-8">
                                {loading ? (
                                    <div className="flex justify-center items-center h-48 text-indigo-600">
                                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-lg font-medium">{t('orders.loading')}</span>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingOutlined className="text-4xl text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('orders.empty')}</h3>
                                        <p className="text-gray-500 mb-6">{t('orders.empty_purchase_desc', "Looks like you haven't made any purchases yet.")}</p>
                                        <button
                                            onClick={() => navigate('/shop')}
                                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
                                        >
                                            {t('orders.shop_now')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order) => {
                                            const statusInfo = getStatusInfo(order.status);
                                            return (
                                                <div key={order._id} className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-colors bg-white shadow-sm">
                                                    <div className="flex flex-col justify-between sm:flex-row mb-6 pb-6 border-b border-gray-100 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-500 mb-1">{t('orders.order_id')}</span>
                                                            <span className="text-lg font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
                                                            <span className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                                                {statusInfo.icon}
                                                                <span className="ml-2">{statusInfo.label}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
                                                        <div className="grid grid-cols-2 gap-8 w-full sm:w-auto">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-500 mb-1">{t('orders.items')}</p>
                                                                <p className="text-xl font-bold text-gray-900">{order.items?.length || 0}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-500 mb-1">{t('orders.total')}</p>
                                                                <p className="text-xl font-bold text-indigo-600">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-transparent rounded-xl hover:bg-indigo-100 transition-colors"
                                                            onClick={() => navigate(`/order/${order._id}`)}
                                                        >
                                                            {t('orders.view_detail')}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
