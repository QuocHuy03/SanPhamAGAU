import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import adminService from '../../../services/adminService';
// import './Categories.css'; // Removed old CSS

const { Title, Text } = Typography;

const generateSlug = (name) =>
    name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\u0111/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchCategories();
    }, [pagination.current, pagination.pageSize]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCategoriesWithPagination({
                page: pagination.current,
                limit: pagination.pageSize
            });
            setCategories(data.data?.categories || data.categories || []);
            setPagination(prev => ({
                ...prev,
                total: data.data?.total || data.total || 0,
            }));
        } catch (error) {
            console.error('Error:', error);
            message.error('Lỗi khi tải danh mục');
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

    const handleOpenModal = (category = null) => {
        setEditCategory(category);
        if (category) {
            form.setFieldsValue({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image: category.image || ''
            });
        } else {
            form.resetFields();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        form.resetFields();
        setEditCategory(null);
    };

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            if (editCategory) {
                await adminService.updateCategory(editCategory._id, values);
                message.success('Cập nhật danh mục thành công!');
            } else {
                await adminService.createCategory(values);
                message.success('Tạo danh mục thành công!');
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteCategory(id);
            message.success('Xóa danh mục thành công!');
            fetchCategories();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        if (!editCategory && value) {
            form.setFieldValue('slug', generateSlug(value));
        }
    };

    const handleRegenerateSlug = () => {
        const name = form.getFieldValue('name');
        if (name) {
            form.setFieldValue('slug', generateSlug(name));
        }
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Typography.Text strong>{text}</Typography.Text>,
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug) => <Text type="secondary">/{slug}</Text>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        style={{ color: '#1677ff' }}
                        onClick={() => handleOpenModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa danh mục"
                        description="Bạn có chắc chắn muốn xóa danh mục này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Quản lý danh mục</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="_id"
                loading={loading}
                size="middle"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} danh mục`
                }}
                onChange={handleTableChange}
            />

            <Modal
                title={editCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={showModal}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input onChange={handleNameChange} placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label={
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span>Slug</span>
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={handleRegenerateSlug}
                                    style={{ padding: 0 }}
                                >
                                    Tạo lại
                                </Button>
                            </div>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}
                    >
                        <Input placeholder="ten-danh-muc" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về danh mục..." />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="URL Hình ảnh"
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCloseModal}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                {editCategory ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Categories;
