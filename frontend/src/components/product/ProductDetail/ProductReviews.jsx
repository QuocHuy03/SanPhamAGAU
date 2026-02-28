import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FaStar, FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import { Rate, message, Button, Input, Progress, Avatar } from 'antd';
import format from 'date-fns/format';
import { vi } from 'date-fns/locale';
import { productService } from '../../../services/productService';

const { TextArea } = Input;

const ProductReviews = ({ productId, reviews = [], rating = 0, numReviews = 0, onReviewAdded }) => {
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    const handleSubmitReview = async () => {
        if (!user) {
            message.warning(t('auth.login_required') || 'Vui lòng đăng nhập để đánh giá');
            return;
        }

        if (!newReview.comment.trim()) {
            message.error(t('product.comment_required') || 'Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            setSubmitting(true);
            await productService.addProductReview(productId, newReview);
            message.success(t('product.review_success') || 'Cảm ơn bạn đã đánh giá sản phẩm!');
            setNewReview({ rating: 5, comment: '' });
            if (onReviewAdded) onReviewAdded();
        } catch (error) {
            console.error('Error submitting review:', error);
            message.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.round(r.rating) === star).length;
        const percent = numReviews > 0 ? (count / numReviews) * 100 : 0;
        return { star, count, percent };
    });

    return (
        <div className="mt-20 space-y-12">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Rating Summary */}
                <div className="w-full md:w-1/3 p-8 rounded-[2.5rem] bg-white/50 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-100/20">
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">{t('product.customer_reviews')}</h3>
                        <div className="text-7xl font-black text-gray-900 tracking-tighter mb-2">{rating.toFixed(1)}</div>
                        <Rate disabled allowHalf defaultValue={rating} className="text-amber-400 text-xl" />
                        <div className="mt-2 text-sm font-bold text-gray-400">{numReviews} {t('product.reviews')}</div>
                    </div>

                    <div className="space-y-3">
                        {breakdown.map((item) => (
                            <div key={item.star} className="flex items-center gap-4">
                                <span className="text-xs font-black text-gray-500 w-4">{item.star}</span>
                                <Progress
                                    percent={item.percent}
                                    showInfo={false}
                                    strokeColor="#4f46e5"
                                    trailColor="#f3f4f6"
                                    strokeWidth={8}
                                    className="flex-1"
                                />
                                <span className="text-xs font-bold text-gray-400 w-8">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Post Review Form */}
                <div className="flex-1 p-8 rounded-[2.5rem] bg-white/50 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-100/20">
                    <h3 className="text-lg font-black text-gray-900 mb-6">{t('product.write_review')}</h3>
                    {user ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-gray-500">{t('product.your_rating')}:</span>
                                <Rate
                                    value={newReview.rating}
                                    onChange={(val) => setNewReview({ ...newReview, rating: val })}
                                    className="text-amber-400"
                                />
                            </div>
                            <TextArea
                                rows={4}
                                placeholder={t('product.review_placeholder') || 'Chia sẻ trải nghiệm của bạn về sản phẩm này...'}
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                className="rounded-2xl border-gray-100 focus:border-indigo-500 focus:ring-indigo-100"
                            />
                            <Button
                                type="primary"
                                size="large"
                                icon={<FaPaperPlane className="mr-2" />}
                                loading={submitting}
                                onClick={handleSubmitReview}
                                className="h-14 px-8 rounded-2xl bg-indigo-600 border-none font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 w-full md:w-auto"
                            >
                                {t('product.submit_review')}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">{t('product.login_to_review') || 'Vui lòng đăng nhập để gửi đánh giá của bạn'}</p>
                            <Button
                                type="link"
                                href="/login"
                                className="text-indigo-600 font-black uppercase tracking-widest"
                            >
                                {t('auth.login_now') || 'Đăng nhập ngay'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 px-4">{t('product.all_reviews')} ({numReviews})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-[2rem] bg-white border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            size={48}
                                            className="bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"
                                            icon={<FaUserCircle />}
                                        />
                                        <div>
                                            <div className="font-black text-gray-900">{review.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {review.createdAt ? format(new Date(review.createdAt), 'dd MMMM, yyyy', { locale: vi }) : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <Rate disabled defaultValue={review.rating} className="text-amber-400 text-xs" />
                                </div>
                                <p className="text-gray-600 leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center rounded-[3rem] bg-gray-50/50 border border-dashed border-gray-200">
                            <div className="text-4xl mb-4">💬</div>
                            <p className="text-gray-400 font-bold">{t('product.no_reviews') || 'Chưa có đánh giá nào cho sản phẩm này'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
