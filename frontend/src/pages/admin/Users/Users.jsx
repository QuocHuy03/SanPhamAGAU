import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Tag, Select, Space, Typography, Popconfirm, message, Tooltip } from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    UnlockOutlined,
    LockOutlined,
    UserOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import adminService from '../../../services/adminService';
import { formatDate } from '../../../utils/helpers';
// import './Users.css'; // Removed old CSS

const { Title, Text } = Typography;
const { Option } = Select;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
            message.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await adminService.updateUser(userId, { role: newRole });
            message.success('Cập nhật quyền thành công!');
            fetchUsers();
        } catch (error) {
            message.error('Lỗi khi cập nhật quyền');
        }
    };

    const handleUpdateStatus = async (userId, isActive) => {
        try {
            await adminService.updateUser(userId, { isActive });
            message.success(`${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công!`);
            fetchUsers();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await adminService.deleteUser(userId);
            message.success('Xóa người dùng thành công!');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: 'id',
            render: (text) => <Text type="secondary">#{text.slice(-6)}</Text>,
            width: 100,
        },
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                    {record.phone && <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>}
                </Space>
            ),
        },
        {
            title: 'Quyền',
            dataIndex: 'role',
            key: 'role',
            render: (role, record) => (
                <Select
                    value={role}
                    onChange={(value) => handleUpdateRole(record._id, value)}
                    style={{ width: 110 }}
                    size="small"
                    bordered={false}
                >
                    <Option value="user">
                        <Tag icon={<UserOutlined />} color="default">User</Tag>
                    </Option>
                    <Option value="admin">
                        <Tag icon={<SafetyCertificateOutlined />} color="volcano">Admin</Tag>
                    </Option>
                </Select>
            ),
            width: 150,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            ),
            width: 120,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
            width: 150,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={record.isActive ? 'Khóa tài khoản' : 'Kích hoạt'}>
                        <Button
                            type="text"
                            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                            onClick={() => handleUpdateStatus(record._id, !record.isActive)}
                            style={{ color: record.isActive ? '#faad14' : '#52c41a' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa tài khoản">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
            width: 120,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Quản lý người dùng</Title>
            </div>

            <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                <Input
                    placeholder="Tìm kiếm theo tên, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={fetchUsers}
                    prefix={<SearchOutlined />}
                    style={{ maxWidth: 400 }}
                    allowClear
                />
                <Button type="primary" onClick={fetchUsers} icon={<SearchOutlined />}>
                    Tìm kiếm
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                size="middle"
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} người dùng`
                }}
            />
        </div>
    );
};

export default Users;
