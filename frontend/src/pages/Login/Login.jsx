import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { login } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const Login = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative z-10 border border-white/50 animate-fadeInUp">

        {/* Left Side: Branding/Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

          <div className="relative z-10">
            <Link to="/" className="text-3xl font-black tracking-tighter">STT<span className="text-indigo-200">.</span></Link>
            <div className="mt-20">
              <h2 className="text-4xl font-extrabold leading-tight mb-6">
                Chào mừng bạn <br /> quay trở lại!
              </h2>
              <p className="text-indigo-100 text-lg max-w-sm mb-10 leading-relaxed font-light">
                Khám phá những bộ sưu tập thời trang mới nhất và tận hưởng trải nghiệm mua sắm đẳng cấp tại STT.
              </p>

              <div className="space-y-6">
                {[
                  { title: t('auth.benefit_1', 'Cập nhật xu hướng mới nhất'), icon: '✨' },
                  { title: t('auth.benefit_2', 'Ưu đãi đặc quyền cho thành viên'), icon: '🎁' },
                  { title: t('auth.benefit_3', 'Thanh toán an toàn & nhanh chóng'), icon: '🔒' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                    <span className="font-medium text-indigo-50 leading-tight">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-sm text-indigo-200/60 font-medium tracking-wide uppercase">
              &copy; 2026 STT Premium Fashion
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center lg:text-left mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login')}</h1>
              <p className="text-gray-500 font-medium">{t('auth.login_subtitle', 'Đăng nhập vào tài khoản của bạn')}</p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold animate-shake">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-4 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                      ${errors.email ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                    `}
                    placeholder={t('auth.email_placeholder', 'Nhập email của bạn')}
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-500 font-bold px-1">{errors.email}</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t('auth.password')}
                  </label>
                  <Link to="/forgot-password" title={t('auth.forgot_password')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    {t('auth.forgot_password_short', 'Quên?')}
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <FaLock className="text-sm" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-4 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                      ${errors.password ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                    `}
                    placeholder={t('auth.password_placeholder', 'Nhập mật khẩu')}
                  />
                </div>
                {errors.password && (
                  <span className="text-xs text-red-500 font-bold px-1">{errors.password}</span>
                )}
              </div>

              <div className="flex items-center px-1">
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-gray-200 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0 transition-all cursor-pointer" />
                  <span className="ml-3 text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{t('auth.remember_me', 'Ghi nhớ đăng nhập')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:shadow-none disabled:active:scale-100"
              >
                <span>{loading ? t('auth.logging_in', 'Đang đăng nhập...') : t('auth.login')}</span>
                {!loading && <FaArrowRight className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                  <span className="bg-white px-4 text-gray-400">{t('auth.or_login_with', 'Hoặc đăng nhập với')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center py-3 px-4 border-2 border-gray-50 rounded-2xl hover:bg-gray-50 hover:border-gray-100 transition-all group">
                  <FaGoogle className="text-red-500 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-700">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center py-3 px-4 border-2 border-gray-50 rounded-2xl hover:bg-gray-50 hover:border-gray-100 transition-all group">
                  <FaFacebookF className="text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-gray-700">Facebook</span>
                </button>
              </div>

              <p className="text-center text-sm font-bold text-gray-500 mt-10">
                {t('auth.no_account')} {' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2 decoration-indigo-600/20 hover:decoration-indigo-600 transition-all font-black">
                  {t('auth.register_now', 'Đăng ký ngay')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;