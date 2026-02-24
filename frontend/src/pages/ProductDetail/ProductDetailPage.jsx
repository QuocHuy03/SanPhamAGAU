import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../../components/product/ProductDetail/ProductDetail';
import ProductList from '../../components/product/ProductList/ProductList';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { productService } from '../../services/productService';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      // Fix: dùng getProductById thay vì getProductBySlug vì route là /product/:id
      const productData = await productService.getProductById(id);
      setProduct(productData);

      if (productData) {
        // Fetch related products bằng ID
        const related = await productService.getRelatedProducts(id);
        setRelatedProducts(related.filter(p => p._id !== id).slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Sản phẩm không tồn tại</h2>
        <p>Sản phẩm bạn đang tìm kiếm không có sẵn.</p>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <ProductDetail product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2 className="section-title">Sản phẩm liên quan</h2>
            <ProductList products={relatedProducts} columns={4} />
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;