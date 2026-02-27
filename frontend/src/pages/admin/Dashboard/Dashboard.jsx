import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Typography, Tag, Space, Button } from 'antd';
import {
  ShoppingOutlined,
  TeamOutlined,
  AppstoreOutlined,
  AccountBookOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { adminService } from '../../../services/adminService';
import { formatCurrency, formatDate } from '../../../utils/helpers';
// import './Dashboard.css'; // Removed old CSS

const { Title } = Typography;

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: 'orange' },
  confirmed: { label: 'Đã xác nhận', color: 'cyan' },
  processing: { label: 'Đang xử lý', color: 'blue' },
  shipped: { label: 'Đang giao', color: 'purple' },
  delivered: { label: 'Đã giao', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'red' }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => `#${text || record._id?.slice(-6)}`,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'name'],
      key: 'customer',
      render: (name) => name || 'Khách vãng lai',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => formatDate(date),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Typography.Text strong>{formatCurrency(total || 0)}</Typography.Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          style={{ color: '#1677ff' }}
          onClick={() => navigate(`/admin/orders/${record._id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Doanh thu tổng"
              value={stats?.totalRevenue || 0}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<AccountBookOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              Tháng này: {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Đơn hàng"
              value={stats?.totalOrders || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              <ArrowUpOutlined style={{ color: '#52c41a' }} /> Hôm nay: +{stats?.newOrdersToday || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Sản phẩm"
              value={stats?.totalProducts || 0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              Danh mục: {stats?.totalCategories || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="Người dùng"
              value={stats?.totalUsers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              <ArrowUpOutlined style={{ color: '#52c41a' }} /> Hôm nay: +{stats?.newUsersToday || 0}
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Card
          bordered={false}
          title="Đơn hàng gần đây"
          extra={<Link to="/admin/orders">Xem tất cả</Link>}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="_id"
            pagination={false}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;