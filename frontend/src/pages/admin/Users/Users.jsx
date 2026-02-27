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
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize]); // Added pagination dependencies

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers({
                search,
                page: pagination.current,
                limit: pagination.pageSize
            });
            // data contains: users, total, page, totalPages
            setUsers(data.users || []);
            setPagination(prev => ({
                ...prev,
                total: data.total || 0,
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
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
            title: 'STT',
            key: 'stt',
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
            width: 70,
            align: 'center',
        },
        {
            title: 'ID',
            align: 'center',
            dataIndex: '_id',
            key: 'id',
            render: (text) => <Text type="secondary">#{text.slice(-6)}</Text>,
            width: 100,
        },
        {
            title: 'Người dùng',
            align: 'center',
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
            align: 'center',
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
            align: 'center',
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
            align: 'center',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
            width: 150,
        },
        {
            title: 'Thao tác',
            align: 'center',
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
                    size="large"
                />
                <Button type="primary" onClick={fetchUsers} icon={<SearchOutlined />} size="large">
                    Tìm kiếm
                </Button>
            </div>

            <Table
                rowSelection={{ type: 'checkbox' }}
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                size="middle"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} người dùng`
                }}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default Users;
