import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import { authService } from '../../../services/authService';
import { updateUser } from '../../../store/slices/authSlice';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { validateUserForm } from '../../../utils/validators';
import './Profile.css';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateUserForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await authService.updateProfile(formData);
      
      dispatch(updateUser(response.user));
      setSuccessMessage('Cập nhật thông tin thành công!');
      setEditMode(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Cập nhật thất bại'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Thông tin tài khoản</h1>
        {!editMode && (
          <button 
            className="btn-edit"
            onClick={() => setEditMode(true)}
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="alert alert-danger">
          {errors.submit}
        </div>
      )}

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-sidebar">
          <div className="avatar-wrapper">
            <div className="avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">{user.email}</p>
            <p className="user-role">
              {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </p>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Đơn hàng</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Yêu thích</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="profile-form-wrapper">
          {editMode ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">
                  <FaUser /> Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <FaPhone /> Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <FaMapMarkerAlt /> Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Thành phố</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                >
                  <option value="">Chọn thành phố</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      phone: user.phone || '',
                      address: user.address || '',
                      city: user.city || ''
                    });
                    setErrors({});
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-group">
                <label>Họ và tên</label>
                <p>{user.name}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="info-group">
                <label>Số điện thoại</label>
                <p>{user.phone || 'Chưa cập nhật'}</p>
              </div>
              <div className="info-group">
                <label>Địa chỉ</label>
                <p>{user.address || 'Chưa cập nhật'}</p>
              </div>
              <div className="info-group">
                <label>Thành phố</label>
                <p>{user.city || 'Chưa cập nhật'}</p>
              </div>
              <div className="info-group">
                <label>Ngày tham gia</label>
                <p>{new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;