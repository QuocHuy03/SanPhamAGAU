import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    Button,
    Card,
    Row,
    Col,
    Upload,
    message,
    Typography,
    Space,
    Divider,
    Image
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    SaveOutlined,
    ReloadOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { productService } from '../../../services/productService';
import { adminService } from '../../../services/adminService';
// import './ProductEdit.css'; // Removed old CSS

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const generateSlug = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
};

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAddMode = !id;
    const isMounted = useRef(true);
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await adminService.getAllCategories();
            if (isMounted.current) {
                setCategories(data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Không thể tải danh mục');
        }
    }, []);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const product = await productService.getProductById(id);
            if (!isMounted.current) return;

            let categoryId = '';
            if (product.category) {
                categoryId = typeof product.category === 'object'
                    ? (product.category._id || '')
                    : product.category;
            }

            form.setFieldsValue({
                name: product.name || '',
                slug: product.slug || '',
                description: product.description || '',
                price: product.price || 0,
                discountPrice: product.discountPrice || null,
                category: categoryId,
                brand: product.brand || '',
                stock: product.stock || 0,
                status: product.status || 'active',
                featured: product.featured || false,
                sizes: product.sizes || [],
                colors: product.colors || []
            });
            setExistingImages(product.images || []);
        } catch (error) {
            if (isMounted.current) {
                message.error('Lỗi khi tải thông tin sản phẩm');
                navigate('/admin/products');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [id, form, navigate]);

    useEffect(() => {
        fetchCategories();
        if (!isAddMode) {
            fetchProduct();
        } else {
            form.setFieldsValue({
                status: 'active',
                featured: false,
                price: 0,
                stock: 0
            });
        }
    }, [fetchCategories, fetchProduct, isAddMode, form]);

    const handleNameChange = (e) => {
        const nameValue = e.target.value;
        if (isAddMode && nameValue) {
            form.setFieldValue('slug', generateSlug(nameValue));
        }
    };

    const handleRegenerateSlug = () => {
        const currentName = form.getFieldValue('name');
        if (currentName) {
            form.setFieldValue('slug', generateSlug(currentName));
        }
    };

    const handleUploadChange = ({ fileList }) => {
        const files = fileList.map(file => file.originFileObj || file);
        setNewImageFiles(files.filter(f => f instanceof File || f instanceof Blob));
    };

    const onFinish = async (values) => {
        setSubmitLoading(true);

        try {
            let productId = id;

            // Clean up values
            const payload = {
                ...values,
                price: Number(values.price),
                stock: Number(values.stock),
                discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
            };

            if (isAddMode) {
                const response = await productService.createProduct(payload);
                productId = response?.data?.data?.product?._id || response?.data?.product?._id;
            } else {
                await productService.updateProduct(id, payload);
            }

            if (newImageFiles.length > 0 && productId) {
                const imgFormData = new FormData();
                newImageFiles.forEach(file => imgFormData.append('images', file));
                try {
                    await productService.uploadImages(productId, imgFormData);
                } catch (imgError) {
                    console.error('Image upload error:', imgError);
                    message.warning('Sản phẩm đã lưu, nhưng một số ảnh upload thất bại.');
                }
            }

            if (isMounted.current) {
                message.success(isAddMode ? 'Tạo sản phẩm thành công!' : 'Cập nhật sản phẩm thành công!');
                navigate('/admin/products');
            }
        } catch (error) {
            if (isMounted.current) {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
            }
        } finally {
            if (isMounted.current) setSubmitLoading(false);
        }
    };

    return (
        <div style={{ paddingBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/products')}
                        size="large"
                    >
                        Quay lại
                    </Button>
                    <Title level={3} style={{ margin: 0 }}>
                        {isAddMode ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
                    </Title>
                </Space>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={submitLoading}
                    onClick={() => form.submit()}
                    size="large"
                >
                    {isAddMode ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
                </Button>
            </div>

            <Form
                form={form}
                layout="vertical"
                size="large"
                onFinish={onFinish}
                initialValues={{ status: 'active', featured: false }}
            >
                <Row gutter={24}>
                    <Col span={16}>
                        <Card loading={loading} style={{ marginBottom: 24 }}>
                            <Title level={5}>Thông tin cơ bản</Title>
                            <Divider style={{ marginTop: 12, marginBottom: 24 }} />

                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                            >
                                <Input
                                    placeholder="Nhập tên sản phẩm"
                                    onChange={handleNameChange}
                                    size="large"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="slug"
                                        label={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <span>Slug (URL thân thiện)</span>
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
                                        <Input placeholder="ten-san-pham" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="category"
                                        label="Danh mục"
                                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                    >
                                        <Select
                                            placeholder="Chọn danh mục"
                                            showSearch
                                            optionFilterProp="children"
                                            size="large"
                                        >
                                            {categories.map(cat => (
                                                <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="brand"
                                        label="Thương hiệu"
                                    >
                                        <Input placeholder="Tên thương hiệu" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Mô tả chi tiết"
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Mô tả chi tiết về sản phẩm..."
                                />
                            </Form.Item>
                        </Card>

                        {/* Sizes and Colors Section */}
                        <Card loading={loading} style={{ marginBottom: 24 }}>
                            <Title level={5}>Biến thể sản phẩm</Title>
                            <Divider style={{ marginTop: 12, marginBottom: 24 }} />

                            <Form.Item
                                name="sizes"
                                label="Kích thước (Size)"
                                tooltip="Nhấn Enter để thêm mới nếu không có trong danh sách"
                            >
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn hoặc nhập size (S, M, L, XL, 38, 39...)"
                                    tokenSeparators={[',']}
                                >
                                    <Option value="S">S</Option>
                                    <Option value="M">M</Option>
                                    <Option value="L">L</Option>
                                    <Option value="XL">XL</Option>
                                    <Option value="XXL">XXL</Option>
                                    <Option value="Free Size">Free Size</Option>
                                </Select>
                            </Form.Item>

                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Màu sắc</Text>
                            </div>
                            <Form.List name="colors">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Row key={key} gutter={16} align="middle" style={{ marginBottom: 12 }}>
                                                <Col span={10}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'name']}
                                                        rules={[{ required: true, message: 'Nhập tên màu' }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input placeholder="Tên màu (VD: Đỏ)" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={10}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'code']}
                                                        rules={[{ required: true, message: 'Chọn mã màu' }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input
                                                            type="color"
                                                            style={{ padding: '0 4px', height: 40 }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                    />
                                                </Col>
                                            </Row>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm màu sắc
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Card>

                        <Card loading={loading}>
                            <Title level={5}>Ảnh sản phẩm</Title>
                            <Divider style={{ marginTop: 12, marginBottom: 24 }} />

                            {existingImages.length > 0 && (
                                <div style={{ marginBottom: 24 }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Ảnh hiện có:</Text>
                                    <Space wrap>
                                        {existingImages.map((img, index) => (
                                            <div key={index} style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 8, background: '#fafafa' }}>
                                                <Image
                                                    src={img.url || img}
                                                    width={100}
                                                    height={100}
                                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                                />
                                            </div>
                                        ))}
                                    </Space>
                                </div>
                            )}

                            <Form.Item label="Upload ảnh mới (tối đa 5 ảnh)">
                                <Upload
                                    listType="picture-card"
                                    multiple
                                    beforeUpload={() => false}
                                    onChange={handleUploadChange}
                                    accept="image/*"
                                    maxCount={5}
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card loading={loading} style={{ marginBottom: 24 }}>
                            <Title level={5}>Giá & Kho hàng</Title>
                            <Divider style={{ marginTop: 12, marginBottom: 24 }} />

                            <Form.Item
                                name="price"
                                label="Giá gốc (VND)"
                                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="0"
                                    size="large"
                                    addonAfter="₫"
                                />
                            </Form.Item>

                            <Form.Item
                                name="discountPrice"
                                label="Giá khuyến mãi (VND)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="0"
                                    size="large"
                                    addonAfter="₫"
                                />
                            </Form.Item>

                            <Form.Item
                                name="stock"
                                label="Số lượng tồn kho"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="0"
                                    size="large"
                                />
                            </Form.Item>
                        </Card>

                        <Card loading={loading}>
                            <Title level={5}>Trạng thái hiển thị</Title>
                            <Divider style={{ marginTop: 12, marginBottom: 24 }} />

                            <Form.Item
                                name="status"
                                label="Trạng thái kinh doanh"
                            >
                                <Select size="large">
                                    <Option value="active">Đang bán</Option>
                                    <Option value="inactive">Ngừng bán</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="featured"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Sản phẩm nổi bật" unCheckedChildren="Bình thường" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default ProductEdit;
