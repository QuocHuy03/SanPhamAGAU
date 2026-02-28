import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative z-10 border border-white/50 animate-fadeInUp">

        {/* Left Side: Branding/Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

          <div className="relative z-10">
            <Link to="/" className="text-3xl font-black tracking-tighter">STT<span className="text-indigo-200">.</span></Link>
            <div className="mt-16">
              <h2 className="text-4xl font-extrabold leading-tight mb-6">
                Tham gia cộng đồng <br /> thời trang STT!
              </h2>
              <p className="text-indigo-100 text-lg max-w-sm mb-10 leading-relaxed font-light">
                Đăng ký ngay để nhận được những ưu đãi sớm nhất, theo dõi đơn hàng dễ dàng và tham gia chương trình khách hàng thân thiết.
              </p>

              <div className="space-y-6">
                {[
                  { title: t('auth.register_benefit_1', 'Giảm 10% cho đơn hàng đầu tiên'), icon: '✨' },
                  { title: t('auth.register_benefit_2', 'Tích điểm đổi quà hấp dẫn'), icon: '💎' },
                  { title: t('auth.register_benefit_3', 'Hỗ trợ đổi trả trong 30 ngày'), icon: '🔄' }
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

          <div className="relative z-10 mt-10">
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="flex items-center space-x-3 mb-3">
                <FaCheckCircle className="text-indigo-300" />
                <span className="text-sm font-bold uppercase tracking-wider">{t('auth.verified_store', 'Cửa hàng xác thực')}</span>
              </div>
              <p className="text-xs text-indigo-100/70 font-medium">Bảo mật thông tin khách hàng là ưu tiên hàng đầu của chúng tôi.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 lg:p-12 flex flex-col justify-center">
          <div className="mx-auto w-full">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.create_account')}</h1>
              <p className="text-gray-500 font-medium">{t('auth.register_subtitle', 'Trở thành thành viên của chúng tôi ngay hôm nay')}</p>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold animate-shake">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    {t('profile.fullname')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                      <FaUser className="text-sm" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                        ${errors.name ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                      `}
                      placeholder={t('auth.name_placeholder', 'Họ tên của bạn')}
                    />
                  </div>
                  {errors.name && (
                    <span className="text-xs text-red-500 font-bold px-1">{errors.name}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    Email
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
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                        ${errors.email ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                      `}
                      placeholder={t('auth.email_placeholder', 'Email của bạn')}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-xs text-red-500 font-bold px-1">{errors.email}</span>
                  )}
                </div>
              </div>

              {/* Password & Confirm Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    {t('auth.password')}
                  </label>
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
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                        ${errors.password ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                      `}
                      placeholder={t('auth.password_placeholder', 'Mật khẩu')}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-xs text-red-500 font-bold px-1">{errors.password}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    {t('auth.confirm_password', 'Xác nhận')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                      <FaLock className="text-sm" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                        ${errors.confirmPassword ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                      `}
                      placeholder={t('auth.confirm_password_placeholder', 'Xác nhận mật khẩu')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-xs text-red-500 font-bold px-1">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              {/* Phone Row */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  {t('profile.phone')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <FaPhone className="text-sm" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm font-medium transition-all duration-200 outline-none
                      ${errors.phone ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-indigo-600/20 focus:bg-white focus:ring-4 focus:ring-indigo-600/5'}
                    `}
                    placeholder={t('auth.phone_placeholder', 'Nhập số điện thoại')}
                  />
                </div>
                {errors.phone && (
                  <span className="text-xs text-red-500 font-bold px-1">{errors.phone}</span>
                )}
              </div>

              <div className="flex items-start px-1 py-2">
                <label className="flex items-start group cursor-pointer">
                  <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg border-2 border-gray-200 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0 transition-all cursor-pointer" />
                  <span className="ml-3 text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors leading-relaxed">
                    {t('auth.agree_terms_1', 'Tôi đồng ý với')} {' '}
                    <Link to="/terms" className="text-indigo-600 underline underline-offset-2 decoration-indigo-600/20 hover:decoration-indigo-600">
                      {t('auth.terms', 'Điều khoản dịch vụ')}
                    </Link> {' '}
                    {t('auth.agree_terms_2', 'và')} {' '}
                    <Link to="/privacy" className="text-indigo-600 underline underline-offset-2 decoration-indigo-600/20 hover:decoration-indigo-600">
                      {t('auth.privacy', 'Chính sách bảo mật')}
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:shadow-none disabled:active:scale-100 mt-4"
              >
                <span>{loading ? t('auth.registering', 'Đang đăng ký...') : t('auth.register')}</span>
                {!loading && <FaArrowRight className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />}
              </button>

              <p className="text-center text-sm font-bold text-gray-500 mt-8">
                {t('auth.have_account')} {' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2 decoration-indigo-600/20 hover:decoration-indigo-600 transition-all font-black">
                  {t('auth.login_now', 'Đăng nhập ngay')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;