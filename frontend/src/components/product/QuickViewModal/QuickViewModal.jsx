import React, { useState } from 'react';
import { Modal, Rate, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { FaShoppingCart } from 'react-icons/fa';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatCurrency } from '../../../utils/helpers';
import ProductGallery from '../ProductDetail/ProductGallery';

const QuickViewModal = ({ visible, onCancel, product }) => {
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
    const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);

    if (!product) return null;

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || product.image,
            quantity,
            color: selectedColor,
            size: selectedSize
        }));
        message.success('Đã thêm vào giỏ hàng');
        onCancel();
    };

    const finalPrice = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

    return (
        <Modal
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={1000}
            centered
            bodyStyle={{ padding: 0 }}
            closeIcon={<div className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white transition-all">✕</div>}
        >
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Gallery Section */}
                <div className="md:w-1/2 p-6 bg-gray-50">
                    <ProductGallery images={product.images || [{ url: product.image }]} />
                </div>

                {/* Info Section */}
                <div className="md:w-1/2 p-8 flex flex-col h-full overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
                            {product.name}
                        </h2>
                        <div className="flex items-center gap-4 mb-4">
                            <Rate disabled defaultValue={product.rating || 5} className="text-amber-400 text-sm" />
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                {product.reviewCount || 0} Nhận xét
                            </span>
                        </div>

                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                                {formatCurrency(finalPrice)}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-xl text-gray-300 line-through font-bold">
                                    {formatCurrency(product.price)}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                            {product.description}
                        </p>

                        {/* Color Selector */}
                        {product.colors?.length > 0 && (
                            <div className="mb-6">
                                <span className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-3">
                                    Màu sắc: <span className="text-indigo-600">{typeof selectedColor === 'string' ? selectedColor : selectedColor?.name}</span>
                                </span>
                                <div className="flex gap-3">
                                    {product.colors.map(color => (
                                        <button
                                            key={typeof color === 'string' ? color : color.name}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all p-1 ${(typeof selectedColor === 'string' ? selectedColor === color : selectedColor?.name === color.name)
                                                ? 'border-indigo-600 scale-110 shadow-lg'
                                                : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <div
                                                className="w-full h-full rounded-full shadow-inner"
                                                style={{ backgroundColor: typeof color === 'string' ? color : color.code }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selector */}
                        {product.sizes?.length > 0 && (
                            <div className="mb-8">
                                <span className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-3">
                                    Kích thước: <span className="text-indigo-600">{selectedSize}</span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 px-6 rounded-xl text-xs font-black transition-all border-2 ${selectedSize === size
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                            <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                <Button
                                    type="text"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center font-black"
                                >-</Button>
                                <span className="w-10 text-center font-black text-gray-900">{quantity}</span>
                                <Button
                                    type="text"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center font-black"
                                >+</Button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-grow h-14 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-900 transition-all shadow-xl shadow-indigo-100 group"
                            >
                                <FaShoppingCart className="group-hover:translate-x-1 transition-transform" />
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default QuickViewModal;
