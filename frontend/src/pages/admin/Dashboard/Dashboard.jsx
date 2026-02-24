import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingBag,
  FaUsers,
  FaBoxes,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { adminService } from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import './Dashboard.css';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ordersResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllOrders({ page: 1, limit: 5 })
      ]);

      // getDashboardStats returns response.data directly
      const statsData = statsResponse?.data?.summary || statsResponse?.summary || statsResponse;
      setStats(statsData);

      // getAllOrders returns response.data which has {orders, ...}
      const ordersData = ordersResponse?.data || ordersResponse;
      setRecentOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>Doanh thu</h3>
            <p className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</p>
            <span className="stat-change positive">
              <FaArrowUp /> Tháng này: {formatCurrency(stats?.monthlyRevenue || 0)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <FaShoppingBag />
          </div>
          <div className="stat-info">
            <h3>Đơn hàng</h3>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
            <span className="stat-change positive">
              <FaArrowUp /> Hôm nay: +{stats?.newOrdersToday || 0}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <FaBoxes />
          </div>
          <div className="stat-info">
            <h3>Sản phẩm</h3>
            <p className="stat-value">{stats?.totalProducts || 0}</p>
            <span className="stat-change">
              <FaArrowDown /> Danh mục: {stats?.totalCategories || 0}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Người dùng</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
            <span className="stat-change positive">
              <FaArrowUp /> Hôm nay: +{stats?.newUsersToday || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <div className="section-header">
          <h2>Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="view-all">
            Xem tất cả
          </Link>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : recentOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order.orderNumber || order._id?.slice(-6)}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatCurrency(order.total || 0)}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${order._id}`} className="view-btn">
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;