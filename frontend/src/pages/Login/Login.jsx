import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { login } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import './Login.css';

const Login = () => {
  console.log('Login component rendering...');
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.email_invalid', 'Email không hợp lệ');
    }

    if (!formData.password) {
      newErrors.password = t('auth.password_required', 'Mật khẩu là bắt buộc');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.password_min_length', 'Mật khẩu phải có ít nhất 6 ký tự');
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
      const response = await authService.login(formData);

      dispatch(login({
        user: response.user,
        token: response.token
      }));

      navigate('/');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || t('auth.login_fail', 'Đăng nhập thất bại')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-wrapper">
          <div className="login-form-container">
            <h1 className="login-title">{t('auth.login')}</h1>

            {errors.submit && (
              <div className="alert alert-danger">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
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
                  placeholder={t('auth.email_placeholder', 'Nhập email của bạn')}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

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

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> {t('auth.remember_me', 'Ghi nhớ đăng nhập')}
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  {t('auth.forgot_password')}
                </Link>
              </div>

              <button
                type="submit"
                className="btn-primary login-btn"
                disabled={loading}
              >
                {loading ? t('auth.logging_in', 'Đang đăng nhập...') : t('auth.login')}
              </button>

              <div className="social-login">
                <p className="divider">{t('auth.or_login_with', 'Hoặc đăng nhập với')}</p>
                <div className="social-buttons">
                  <button type="button" className="btn-social google-btn">
                    Google
                  </button>
                  <button type="button" className="btn-social facebook-btn">
                    Facebook
                  </button>
                </div>
              </div>

              <div className="register-link">
                <p>{t('auth.no_account')} <Link to="/register">{t('auth.register_now', 'Đăng ký ngay')}</Link></p>
              </div>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;