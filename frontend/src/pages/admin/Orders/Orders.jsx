import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Tag, Input, Select, DatePicker, Row, Col, Typography, Space, Button, Card, message, Statistic } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../../services/adminService';
import { formatCurrency, formatDate } from '../../../utils/helpers';
// import './Orders.css'; // Removed old CSS

const { Title, Text } = Typography;
const { Option } = Select;

const ORDER_STATUS_MAP = {
  pending: { text: 'Chờ xác nhận', color: 'orange' },
  confirmed: { text: 'Đã xác nhận', color: 'cyan' },
  processing: { text: 'Đang xử lý', color: 'blue' },
  shipped: { text: 'Đang giao', color: 'purple' },
  delivered: { text: 'Đã giao', color: 'green' },
  cancelled: { text: 'Đã hủy', color: 'red' }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, selectedStatus, selectedDate, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllOrders({
        page: pagination.current,
        limit: pagination.pageSize,
        status: selectedStatus,
        date: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
        keyword: searchTerm
      });

      // Backend trả về response.data.data.orders
      const data = response?.data || response;
      setOrders(data.orders || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  // Removed client-side filtering

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 70,
      align: 'center',
    },
    {
      title: 'Mã đơn',
      align: 'center',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/admin/orders/${record._id}`)} style={{ padding: 0 }}>
          #{text || record._id?.slice(-6)}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      align: 'center',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user?.name || 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email || ''}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.phone || ''}</Text>
        </Space>
      ),
    },
    {
      title: 'Ngày đặt',
      align: 'center',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Sản phẩm',
      align: 'center',
      key: 'items',
      render: (_, record) => `${record.items?.length || 0} sản phẩm`,
    },
    {
      title: 'Tổng tiền',
      align: 'center',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>{formatCurrency(total || 0)}</Text>,
    },
    {
      title: 'Thanh toán',
      align: 'center',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? 'Đã TT' : 'Chưa TT'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      align: 'center',
      key: 'status',
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => handleStatusChange(record._id, value)}
          style={{ width: 130 }}
          bordered={false}
          className={`status-select-${record.status}`}
          dropdownMatchSelectWidth={false}
        >
          {Object.entries(ORDER_STATUS_MAP).map(([key, status]) => (
            <Option key={key} value={key}>
              <Tag color={status.color} style={{ margin: 0 }}>{status.text}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      align: 'center',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/orders/${record._id}`)}
            title="Xem chi tiết"
          />
          {record.status === 'pending' && (
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusChange(record._id, 'cancelled')}
              title="Hủy đơn"
            />
          )}
          {record.status === 'confirmed' && (
            <Button
              type="text"
              style={{ color: '#1677ff' }}
              icon={<CarOutlined />}
              onClick={() => handleStatusChange(record._id, 'shipped')}
              title="Giao hàng"
            />
          )}
          {record.status === 'shipped' && (
            <Button
              type="text"
              style={{ color: '#52c41a' }}
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record._id, 'delivered')}
              title="Hoàn thành"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý đơn hàng</Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false}>
            <Statistic title="Tổng đơn" value={pagination.total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false}>
            <Statistic
              title="Chờ xử lý"
              value={orders.filter(o => o.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false}>
            <Statistic
              title="Đang giao"
              value={orders.filter(o => o.status === 'shipped').length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={6} md={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Tất cả trạng thái"
            value={selectedStatus || undefined}
            onChange={setSelectedStatus}
            allowClear
            size="large"
          >
            {Object.entries(ORDER_STATUS_MAP).map(([key, status]) => (
              <Option key={key} value={key}>{status.text}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={6} md={8}>
          <DatePicker
            style={{ width: '100%' }}
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Chọn ngày đặt"
            format="DD/MM/YYYY"
            size="large"
          />
        </Col>
      </Row>

      <Table
        rowSelection={{ type: 'checkbox' }}
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        size="middle"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default AdminOrders;