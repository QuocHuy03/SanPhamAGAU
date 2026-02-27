import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaStar, FaShoppingCart, FaHeart, FaShareAlt } from 'react-icons/fa';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';
import ProductGallery from './ProductGallery';
import SizeSelector from './SizeSelector';
import ColorSelector from './ColorSelector';
import './ProductDetail.css';

const ProductDetail = ({ product }) => {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Redirect to cart page
    window.location.href = '/cart';
  };

  return (
    <div className="product-detail">
      <div className="product-detail-content">
        {/* Product Gallery */}
        <div className="product-gallery-section">
          <ProductGallery images={product.images} />
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(product.rating) ? 'filled' : ''} />
                ))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviewCount} đánh giá)
              </span>
              <span className="sku">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="product-price-section">
            {product.discountPrice ? (
              <>
                <span className="current-price">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="original-price">
                  {formatCurrency(product.price)}
                </span>
                <span className="discount-percent">
                  -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="current-price">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="selection-section">
              <h3>Kích thước:</h3>
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="selection-section">
              <h3>Màu sắc:</h3>
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="quantity-section">
            <h3>Số lượng:</h3>
            <div className="quantity-control">
              <button
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="quantity-input"
                min="1"
              />
              <button
                className="quantity-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="product-actions">
            <button className="btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Thêm vào giỏ
            </button>
            <button className="btn buy-now-btn" onClick={handleBuyNow}>
              Mua ngay
            </button>
            <button className="btn-outline wishlist-btn">
              <FaHeart /> Yêu thích
            </button>
            <button className="btn-outline share-btn">
              <FaShareAlt /> Chia sẻ
            </button>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <div className="info-item">
              <strong>Danh mục:</strong> {typeof product.category === 'object' ? product.category?.name : product.category}
            </div>
            <div className="info-item">
              <strong>Thương hiệu:</strong> {product.brand}
            </div>
            <div className="info-item">
              <strong>Tình trạng:</strong>
              <span className={`status ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                {product.inStock ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;