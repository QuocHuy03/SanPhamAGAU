import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Modal, Image, Tag, Typography, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../../services/adminService';
import { productService } from '../../../services/productService';
import { formatCurrency, formatDate } from '../../../utils/helpers';
// import './Products.css'; // Removed old CSS

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const showDeleteConfirm = (product) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      icon: <ExclamationCircleOutlined />,
      content: `Sản phẩm: ${product.name}`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        return handleDelete(product._id || product.id);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteProduct(id);
      setProducts(products.filter(p => (p._id || p.id) !== id));
      message.success('Đã xóa sản phẩm thành công');
    } catch (error) {
      message.error('Lỗi khi xóa sản phẩm');
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // category can be an object {_id, name, slug} or a string
    const productCategorySlug = typeof product.category === 'object'
      ? product.category?.slug
      : product.categorySlug;

    const matchesCategory = !selectedCategory || productCategorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images) => (
        <Image
          src={images && images.length > 0 ? images[0] : ''}
          alt="product"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="https://via.placeholder.com/60"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{text}</Typography.Text>
          {record.featured && <Tag color="gold">Nổi bật</Tag>}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => typeof category === 'object' ? category?.name : category,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Giá KM',
      dataIndex: 'discountPrice',
      key: 'discountPrice',
      render: (discountPrice) => discountPrice ? <Typography.Text type="danger">{formatCurrency(discountPrice)}</Typography.Text> : '-',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.inStock ? 'green' : 'red'}>
          {record.inStock ? 'Còn hàng' : 'Hết hàng'}
        </Tag>
      ),
      filters: [
        { text: 'Còn hàng', value: true },
        { text: 'Hết hàng', value: false },
      ],
      onFilter: (value, record) => record.inStock === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const id = record._id || record.id;
        return (
          <Space size="middle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/product/${id}`, '_blank')}
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#1677ff' }}
              onClick={() => navigate(`/admin/products/edit/${id}`)}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý sản phẩm</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/products/add')}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo danh mục"
          value={selectedCategory || undefined}
          onChange={setSelectedCategory}
          allowClear
        >
          {categories.map(category => (
            <Option key={category._id || category.id} value={category.slug}>
              {category.name}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey={(record) => record._id || record.id}
        loading={loading}
        size="middle"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} mục`
        }}
      />
    </div>
  );
};

export default AdminProducts;