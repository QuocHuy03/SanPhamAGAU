import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form] = Form.useForm();

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/coupons', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCoupons(data.data.coupons);
        } catch (error) {
            message.error('Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleAdd = () => {
        setEditingCoupon(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCoupon(record);
        form.setFieldsValue({
            ...record,
            expiryDate: dayjs(record.expiryDate)
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/coupons/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success('Đã xóa mã giảm giá');
            fetchCoupons();
        } catch (error) {
            message.error('Lỗi khi xóa mã giảm giá');
        }
    };

    const onFinish = async (values) => {
        try {
            const payload = {
                ...values,
                expiryDate: values.expiryDate.toISOString()
            };

            if (editingCoupon) {
                await axios.put(`/api/coupons/${editingCoupon._id}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                message.success('Cập nhật mã giảm giá thành công');
            } else {
                await axios.post('/api/coupons', payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                message.success('Thêm mã giảm giá thành công');
            }
            setIsModalVisible(false);
            fetchCoupons();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong className="text-indigo-600">{text}</Text>,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'percentage' ? 'cyan' : 'gold'}>
                    {type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                </Tag>
            ),
        },
        {
            title: 'Giá trị',
            dataIndex: 'value',
            key: 'value',
            render: (val, record) => (
                <Text strong>
                    {val.toLocaleString()}{record.type === 'percentage' ? '%' : 'đ'}
                </Text>
            ),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minAmount',
            key: 'minAmount',
            render: (val) => `${val.toLocaleString()}đ`,
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'Đang chạy' : 'Dừng'}
                </Tag>
            ),
        },
        {
            title: 'Lượt dùng',
            key: 'usage',
            render: (_, record) => `${record.usedCount} / ${record.usageLimit}`,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="text-indigo-600 hover:bg-indigo-50"
                    />
                    <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(record._id)}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="hover:bg-rose-50"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Card
                className="rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden"
                title={
                    <div className="flex items-center gap-3 py-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <GiftOutlined style={{ fontSize: '24px' }} />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>Quản lý Mã giảm giá</Title>
                            <Text type="secondary">Tạo và quản lý các chương trình khuyến mãi cho khách hàng</Text>
                        </div>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-100 font-bold"
                    >
                        Tạo mã mới
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={coupons}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    className="custom-table"
                />
            </Card>

            <Modal
                title={editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
                className="premium-modal"
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ type: 'percentage', isActive: true, minAmount: 0 }}
                    className="pt-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="code"
                            label="Mã giảm giá (VD: SALE50)"
                            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                        >
                            <Input className="h-12 rounded-xl" placeholder="SALE2024" />
                        </Form.Item>

                        <Form.Item
                            name="type"
                            label="Loại giảm giá"
                            rules={[{ required: true }]}
                        >
                            <Select className="h-12 rounded-xl">
                                <Select.Option value="percentage">Phần trăm (%)</Select.Option>
                                <Select.Option value="fixed">Số tiền cố định (đ)</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="value"
                            label="Giá trị giảm"
                            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                        >
                            <InputNumber className="w-full h-12 rounded-xl flex items-center" min={1} />
                        </Form.Item>

                        <Form.Item
                            name="minAmount"
                            label="Đơn hàng tối thiểu"
                            rules={[{ required: true }]}
                        >
                            <InputNumber className="w-full h-12 rounded-xl flex items-center" min={0} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="expiryDate"
                            label="Ngày hết hạn"
                            rules={[{ required: true }]}
                        >
                            <DatePicker className="w-full h-12 rounded-xl" />
                        </Form.Item>

                        <Form.Item
                            name="usageLimit"
                            label="Giới hạn lượt dùng"
                            rules={[{ required: true }]}
                        >
                            <InputNumber className="w-full h-12 rounded-xl flex items-center" min={1} />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} className="rounded-xl" placeholder="Thông tin chi tiết về mã giảm giá..." />
                    </Form.Item>

                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                        <Select className="h-12 rounded-xl">
                            <Select.Option value={true}>Kích hoạt</Select.Option>
                            <Select.Option value={false}>Dừng kích hoạt</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button onClick={() => setIsModalVisible(false)} className="h-12 px-8 rounded-xl font-bold">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" className="h-12 px-8 rounded-xl bg-indigo-600 border-none font-bold">
                            {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style jsx="true">{`
        .custom-table .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          color: #94a3b8;
          border-bottom: 2px solid #f1f5f9;
        }
        .premium-modal .ant-modal-content {
          border-radius: 2rem;
          padding: 2rem;
        }
        .ant-form-item-label > label {
          font-weight: 700;
          color: #475569;
          font-size: 13px;
        }
      `}</style>
        </div>
    );
};

export default AdminCoupons;
