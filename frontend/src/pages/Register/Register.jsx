import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import './Register.css';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (!formData.name) {
      newErrors.name = t('auth.name_required', 'Họ tên là bắt buộc');
    }

    if (!formData.email) {
      newErrors.email = t('auth.email_required', 'Email là bắt buộc');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.email_invalid', 'Email không hợp lệ');
    }

    if (!formData.password) {
      newErrors.password = t('auth.password_required', 'Mật khẩu là bắt buộc');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.password_min_length', 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirm_password_required', 'Xác nhận mật khẩu là bắt buộc');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.password_mismatch', 'Mật khẩu không khớp');
    }

    if (!formData.phone) {
      newErrors.phone = t('auth.phone_required', 'Số điện thoại là bắt buộc');
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = t('auth.phone_invalid', 'Số điện thoại không hợp lệ');
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
      await authService.register(formData);

      navigate('/login', {
        state: { message: t('auth.register_success', 'Đăng ký thành công! Vui lòng đăng nhập.') }
      });
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || t('auth.register_fail', 'Đăng ký thất bại')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-wrapper">
          <div className="register-form-container">
            <h1 className="register-title">{t('auth.create_account')}</h1>

            {errors.submit && (
              <div className="alert alert-danger">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  {t('profile.fullname')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder={t('auth.name_placeholder', 'Nhập họ tên của bạn')}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder={t('auth.email_placeholder', 'Nhập email của bạn')}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    {t('auth.password')}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder={t('auth.password_placeholder', 'Nhập mật khẩu')}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    {t('auth.confirm_password', 'Xác nhận mật khẩu')}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder={t('auth.confirm_password_placeholder', 'Nhập lại mật khẩu')}
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  {t('profile.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder={t('auth.phone_placeholder', 'Nhập số điện thoại')}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-agreement">
                <label className="agreement-checkbox">
                  <input type="checkbox" required />
                  <span>{t('auth.agree_terms_1', 'Tôi đồng ý với')} <Link to="/terms">{t('auth.terms', 'Điều khoản dịch vụ')}</Link> {t('auth.agree_terms_2', 'và')} <Link to="/privacy">{t('auth.privacy', 'Chính sách bảo mật')}</Link></span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary register-btn"
                disabled={loading}
              >
                {loading ? t('auth.registering', 'Đang đăng ký...') : t('auth.register')}
              </button>

              <div className="login-link">
                <p>{t('auth.have_account')} <Link to="/login">{t('auth.login_now', 'Đăng nhập ngay')}</Link></p>
              </div>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Register;