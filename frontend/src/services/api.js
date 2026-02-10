import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance - SỬA BASE URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:6000/api',
  timeout: 15000, // Tăng timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Thêm dòng này nếu dùng cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request cho debug
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    const { response, request, message } = error;
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: response?.status,
      message: message,
      data: response?.data
    });
    
    if (response) {
      switch (response.status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
            toast.error('Phiên đăng nhập đã hết hạn');
          }
          break;
          
        case 403:
          toast.error('Bạn không có quyền truy cập');
          break;
          
        case 404:
          toast.error('Không tìm thấy tài nguyên');
          break;
          
        case 500:
          toast.error('Lỗi máy chủ');
          break;
          
        default:
          if (response.data?.message) {
            toast.error(response.data.message);
          }
      }
    } else if (request && !response) {
      // Network error
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else if (message === 'Network Error') {
      toast.error('Không thể kết nối đến máy chủ');
    } else if (message.includes('timeout')) {
      toast.error('Yêu cầu quá thời gian chờ');
    }
    
    return Promise.reject(error);
  }
);

export default api;