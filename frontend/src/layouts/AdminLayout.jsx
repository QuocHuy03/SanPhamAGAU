import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang quản trị!');
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null; // Or a loading spinner
  }

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard' },
    { path: '/admin/products', name: 'Quản lý sản phẩm' },
    { path: '/admin/orders', name: 'Quản lý đơn hàng' },
    { path: '/admin/users', name: 'Quản lý người dùng' },
    { path: '/admin/categories', name: 'Danh mục' },
    { path: '/admin/settings', name: 'Cài đặt' },
  ];

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="sidebar-logo">
            {isSidebarOpen ? 'Admin Panel' : 'AP'}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {isSidebarOpen && (
            <div className="user-info">
              <p className="user-name">{user?.name || 'Admin'}</p>
              <p className="user-role">Quản trị viên</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {isSidebarOpen && <span className="nav-text" style={{ marginLeft: 0 }}>{item.name}</span>}
              {!isSidebarOpen && <span className="nav-text-collapsed" style={{ fontSize: '20px', marginLeft: 'auto', marginRight: 'auto' }}>{item.name.charAt(0)}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            {isSidebarOpen && <span className="nav-text" style={{ marginLeft: 0 }}>Đăng xuất</span>}
            {!isSidebarOpen && <span className="nav-text-collapsed" style={{ fontSize: '20px', marginLeft: 'auto', marginRight: 'auto' }}>🚪</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
          <h1 className="page-title">Dashboard</h1>
          <div className="header-actions">
            <span className="welcome-text">
              Xin chào, {user?.name || 'Admin'}!
            </span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;