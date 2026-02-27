import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError(t('auth.forgot_password_email_required', 'Vui lòng nhập email'));
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/auth/forgot-password', { email });

            setSuccess(true);
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || t('auth.forgot_password_fail', 'Có lỗi xảy ra. Vui lòng thử lại.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="container">
                <div className="forgot-password-wrapper">
                    <div className="forgot-password-container">
                        <h1 className="forgot-password-title">{t('auth.forgot_password_title')}</h1>
                        <p className="forgot-password-subtitle">
                            {t('auth.forgot_password_subtitle')}
                        </p>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {t('auth.forgot_password_success', 'Mã xác nhận đã được gửi! Đang chuyển hướng...')}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    {t('auth.email')}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                    placeholder="example@email.com"
                                    disabled={loading || success}
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || success}
                            >
                                {loading ? t('auth.sending', 'Đang gửi...') : success ? t('auth.sent', 'Đã gửi!') : t('auth.send_code', 'Gửi mã xác nhận')}
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

export default ForgotPassword;
