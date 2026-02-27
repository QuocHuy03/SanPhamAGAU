import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || '';

    const [formData, setFormData] = useState({
        email: emailFromState,
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrors({
            ...errors,
            [e.target.name]: ''
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = t('auth.email_required', 'Email là bắt buộc');
        }

        if (!formData.code) {
            newErrors.code = t('auth.reset_code_required', 'Mã xác nhận là bắt buộc');
        } else if (formData.code.length !== 6) {
            newErrors.code = t('auth.reset_code_invalid', 'Mã xác nhận phải có 6 số');
        }

        if (!formData.newPassword) {
            newErrors.newPassword = t('auth.new_password_required', 'Mật khẩu mới là bắt buộc');
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = t('auth.password_min_length', 'Mật khẩu phải có ít nhất 6 ký tự');
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.confirm_password_required', 'Xác nhận mật khẩu là bắt buộc');
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.password_mismatch', 'Mật khẩu không khớp');
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            await axios.post('/api/auth/reset-password', {
                email: formData.email,
                code: formData.code,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setErrors({
                submit: err.response?.data?.message || t('auth.forgot_password_fail', 'Có lỗi xảy ra. Vui lòng thử lại.')
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="container">
                <div className="reset-password-wrapper">
                    <div className="reset-password-container">
                        <h1 className="reset-password-title">{t('auth.reset_password_title', 'Đặt lại mật khẩu')}</h1>
                        <p className="reset-password-subtitle">
                            {t('auth.reset_password_subtitle', 'Nhập mã xác nhận đã được gửi đến email của bạn')}
                        </p>

                        {errors.submit && (
                            <div className="alert alert-danger">
                                {errors.submit}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {t('auth.reset_password_success', 'Đặt lại mật khẩu thành công! Đang chuyển hướng...')}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="reset-password-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    {t('auth.email')}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="example@email.com"
                                    disabled={loading || success}
                                />
                                {errors.email && (
                                    <span className="error-message">{errors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="code" className="form-label">
                                    {t('auth.reset_code_label', 'Mã xác nhận (6 số)')}
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className={`form-input code-input ${errors.code ? 'error' : ''}`}
                                    placeholder="123456"
                                    maxLength="6"
                                    disabled={loading || success}
                                />
                                {errors.code && (
                                    <span className="error-message">{errors.code}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">
                                    {t('auth.new_password', 'Mật khẩu mới')}
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                                    placeholder={t('auth.new_password_placeholder', 'Nhập mật khẩu mới')}
                                    disabled={loading || success}
                                />
                                {errors.newPassword && (
                                    <span className="error-message">{errors.newPassword}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    {t('auth.confirm_password_new', 'Xác nhận mật khẩu mới')}
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder={t('auth.confirm_password_placeholder', 'Nhập lại mật khẩu')}
                                    disabled={loading || success}
                                />
                                {errors.confirmPassword && (
                                    <span className="error-message">{errors.confirmPassword}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || success}
                            >
                                {loading ? t('auth.processing', 'Đang xử lý...') : success ? t('auth.success', 'Thành công!') : t('auth.reset_password_btn', 'Đặt lại mật khẩu')}
                            </button>

                            <div className="back-to-login">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="link-btn"
                                >
                                    ← {t('auth.back_to_login', 'Quay lại đăng nhập')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
