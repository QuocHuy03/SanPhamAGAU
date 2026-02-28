import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { Button, Empty, Spin } from 'antd';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { items, loading } = useSelector(state => state.wishlist);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, user]);

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-center pt-20">
                <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex flex-center mx-auto mb-6">
                        <FaHeart className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Danh sách yêu thích</h2>
                    <p className="text-gray-500 mb-8 font-medium">Vui lòng đăng nhập để xem các sản phẩm bạn đã lưu.</p>
                    <Link to="/login">
                        <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg shadow-indigo-100">
                            Đăng nhập ngay
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pt-12 pb-24 px-4">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tighter uppercase">Yêu thích</h1>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                            Bạn có <span className="text-indigo-600">{items.length}</span> sản phẩm trong danh sách
                        </p>
                    </div>
                    <Link to="/shop">
                        <Button
                            type="text"
                            icon={<FaShoppingBag className="mr-2" />}
                            className="font-black uppercase tracking-widest text-xs h-12 px-6 rounded-xl hover:bg-white hover:shadow-md transition-all"
                        >
                            Tiếp tục mua sắm
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-center">
                        <Spin size="large" />
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map(product => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="flex flex-col gap-2">
                                    <span className="text-xl font-black text-gray-900 uppercase">Chưa có sản phẩm nào</span>
                                    <span className="text-gray-400 font-medium">Hãy duyệt qua cửa hàng để tìm những bộ đồ ưng ý nhất!</span>
                                </div>
                            }
                        >
                            <Link to="/shop">
                                <button className="mt-8 px-10 h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                                    Đến cửa hàng
                                </button>
                            </Link>
                        </Empty>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
