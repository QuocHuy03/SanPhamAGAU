import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Input, Select, DatePicker, Row, Col, Typography, Space, Button, Card, message, Statistic, Modal, Divider, List, Avatar } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../../services/adminService';
import { formatCurrency, formatDate } from '../../../utils/helpers';

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, pagination.current, pagination.pageSize, selectedStatus, selectedDate, searchTerm]);

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
        <Button type="link" onClick={() => handleViewOrder(record._id || record.id)} style={{ padding: 0 }}>
          #{text || (record._id || record.id)?.slice(-6)}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      align: 'center',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.shippingAddress?.fullName || record.user?.name || 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email || ''}</Text>
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
      title: 'Trạng thái',
      align: 'center',
      key: 'status',
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => handleStatusChange(record._id || record.id, value)}
          style={{ width: 130 }}
          bordered={false}
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
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record._id || record.id)}
            title="Xem chi tiết"
          />
          {record.status === 'pending' && (
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusChange(record._id || record.id, 'cancelled')}
              title="Hủy đơn"
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
            placeholder="Tìm kiếm theo mã đơn, khách hàng..."
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
        rowKey={(record) => record._id || record.id}
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
                  <Text><strong>Trạng thái:</strong> <Tag color={ORDER_STATUS_MAP[selectedOrder.status].color}>{ORDER_STATUS_MAP[selectedOrder.status].text}</Tag></Text>
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

export default AdminOrders;