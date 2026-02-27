import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Card, Button, Typography, message, Spin, Row, Col, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { adminService } from '../../../services/adminService';
// import './Settings.css'; // Removed old CSS

const { Title } = Typography;
const { Option } = Select;

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const result = await adminService.getSettings();
            const settings = result?.data?.settings || result?.settings || result;
            if (settings) {
                form.setFieldsValue({
                    siteName: settings.siteName || 'ShopThoiTrang',
                    email: settings.email || 'admin@shopthoitrang.com',
                    phone: settings.phone || '0123456789',
                    address: settings.address || 'Hanoi, Vietnam',
                    currency: settings.currency || 'VND',
                    shippingFee: settings.shippingFee || 30000,
                    freeShippingThreshold: settings.freeShippingThreshold || 500000,
                    defaultLanguage: settings.defaultLanguage || 'vi'
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            message.error('Lỗi khi tải cài đặt');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            await adminService.updateSettings(values);
            message.success('Lưu cài đặt thành công!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
                <Spin size="large" tip="Đang tải cài đặt..." />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>Cài đặt hệ thống</Title>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={() => form.submit()}
                    size="large"
                >
                    Lưu cài đặt
                </Button>
            </div>

            <Form
                form={form}
                layout="vertical"
                size="large"
                onFinish={handleSubmit}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card title="Thông tin chung" bordered={false}>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="siteName" label="Tên cửa hàng" rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}>
                                            <Input placeholder="Nhập tên cửa hàng" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="email" label="Email nhận phản hồi" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                                            <Input placeholder="admin@example.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="phone" label="Số điện thoại liên hệ" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                                            <Input placeholder="0123456789" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="address" label="Địa chỉ">
                                            <Input placeholder="Nhập địa chỉ cửa hàng" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            <Card title="Cấu hình bán hàng" bordered={false}>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="shippingFee" label="Phí vận chuyển mặc định (VND)" rules={[{ required: true, message: 'Vui lòng nhập phí vận chuyển!' }]}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="freeShippingThreshold"
                                            label="Ngưỡng miễn phí vận chuyển (VND)"
                                            rules={[{ required: true, message: 'Vui lòng nhập ngưỡng miễn phí vận chuyển!' }]}
                                            extra="Đơn hàng có tổng giá trị trên mức này sẽ được miễn phí vận chuyển."
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Space>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card title="Quốc tế hóa" bordered={false}>
                                <Form.Item name="currency" label="Đơn vị tiền tệ">
                                    <Select>
                                        <Option value="VND">VND (₫ Việt Nam đồng)</Option>
                                        <Option value="USD">USD ($ Đô la Mỹ)</Option>
                                        <Option value="CNY">CNY (¥ Nhân dân tệ)</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="defaultLanguage" label="Ngôn ngữ hiển thị mặc định">
                                    <Select>
                                        <Option value="vi">🇻🇳 Tiếng Việt</Option>
                                        <Option value="en">🇺🇸 English</Option>
                                        <Option value="zh">🇨🇳 中文</Option>
                                    </Select>
                                </Form.Item>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default Settings;
