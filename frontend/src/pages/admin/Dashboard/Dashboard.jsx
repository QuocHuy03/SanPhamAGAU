import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Statistic, Table, Typography, Tag, Space, Button, Modal, Divider, List, Avatar, message } from 'antd';
import {
  ShoppingOutlined,
  TeamOutlined,
  AppstoreOutlined,
  AccountBookOutlined,
  ArrowUpOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { adminService } from '../../../services/adminService';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const { Title, Text } = Typography;

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

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

      const statsData = statsResponse?.data?.summary || statsResponse?.summary || statsResponse;
      setStats(statsData);

      const ordersData = ordersResponse?.data || ordersResponse;
      setRecentOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setModalLoading(true);
      setIsModalVisible(true);
      const data = await adminService.getOrderDetail(orderId);
      setSelectedOrder(data?.order || data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      message.error('Lỗi khi tải chi tiết đơn hàng');
      setIsModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewOrder(record._id || record.id)} style={{ padding: 0 }}>
          #{text || (record._id || record.id)?.slice(-6)}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => record.shippingAddress?.fullName || record.user?.name || 'Khách vãng lai',
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
      render: (total) => <Text strong>{formatCurrency(total || 0)}</Text>,
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
          onClick={() => handleViewOrder(record._id || record.id)}
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

      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.orderNumber ? '#' + selectedOrder.orderNumber : ''}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        loading={modalLoading}
      >
        {selectedOrder && (
          <div>
            <Row gutter={24}>
              <Col span={12}>
                <Divider orientation="left">Thông tin khách hàng</Divider>
                <Space direction="vertical">
                  <Text><strong>Họ tên:</strong> {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}</Text>
                  <Text><strong>Điện thoại:</strong> {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone}</Text>
                  <Text><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Divider orientation="left">Thông tin đơn hàng</Divider>
                <Space direction="vertical">
                  <Text><strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</Text>
                  <Text><strong>Trạng thái:</strong> <Tag color={STATUS_CONFIG[selectedOrder.status]?.color}>{STATUS_CONFIG[selectedOrder.status]?.label}</Tag></Text>
                  <Text><strong>Thanh toán:</strong> <Tag color={selectedOrder.paymentStatus === 'paid' ? 'green' : 'orange'}>{selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag></Text>
                  <Text><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</Text>
                </Space>
              </Col>
            </Row>

            <Divider orientation="left">Danh sách sản phẩm</Divider>
            <List
              itemLayout="horizontal"
              dataSource={selectedOrder.items}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={64} src={item.image} />}
                    title={<a href={`/product/${item.product?._id || item.product}`} target="_blank" rel="noopener noreferrer">{item.name}</a>}
                    description={`Số lượng: ${item.quantity} | Màu: ${item.color} | Size: ${item.size}`}
                  />
                  <div>{formatCurrency(item.price * item.quantity)}</div>
                </List.Item>
              )}
            />

            <div style={{ textAlign: 'right', marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Tạm tính:</Text> <Text strong>{formatCurrency(selectedOrder.subtotal || 0)}</Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Phí vận chuyển:</Text> <Text strong>{formatCurrency(selectedOrder.shippingFee || 0)}</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div>
                <Text strong style={{ fontSize: 18 }}>Tổng cộng:</Text> <Text strong style={{ fontSize: 24, color: '#f5222d' }}>{formatCurrency(selectedOrder.total || 0)}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;