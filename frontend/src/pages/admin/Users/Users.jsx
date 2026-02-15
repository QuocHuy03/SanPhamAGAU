import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers({ search });
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await adminService.updateUser(userId, { role: newRole });
            alert('Cập nhật role thành công!');
            fetchUsers();
        } catch (error) {
            alert('Lỗi khi cập nhật role');
        }
    };

    const handleUpdateStatus = async (userId, isActive) => {
        try {
            await adminService.updateUser(userId, { isActive });
            alert(`${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công!`);
            fetchUsers();
        } catch (error) {
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

        try {
            await adminService.deleteUser(userId);
            alert('Xóa người dùng thành công!');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xóa người dùng');
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="admin-users">
            <div className="page-header">
                <h1>Quản lý người dùng</h1>
            </div>

            <div className="users-filters">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && fetchUsers()}
                    className="search-input"
                />
                <button onClick={fetchUsers} className="btn-search">🔍 Tìm kiếm</button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Role</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>#{user._id.slice(-6)}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || 'N/A'}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                        className={`role-badge ${user.role}`}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Hoạt động' : 'Khóa'}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="actions">
                                    <button
                                        onClick={() => handleUpdateStatus(user._id, !user.isActive)}
                                        className="btn-icon"
                                        title={user.isActive ? 'Khóa' : 'Kích hoạt'}
                                    >
                                        {user.isActive ? '🔒' : '🔓'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="btn-icon delete"
                                        title="Xóa"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="empty-state">Không tìm thấy người dùng nào</div>
            )}
        </div>
    );
};

export default Users;
