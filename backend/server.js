require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const connectDB = require('./src/config/database');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();

// ========== MIDDLEWARE ==========
app.use(cors()); // QUAN TRỌNG: Cho phép trình duyệt truy cập
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xssClean());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn 100 requests
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// ========== KẾT NỐI DB ==========
connectDB().then(() => {
  console.log('📦 Database connection established');
}).catch(err => {
  console.error('❌ Database connection failed:', err);
});

// ========== ROUTES ==========
// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🛒 E-commerce API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      users: '/api/users'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Import và sử dụng các routes - THÊM NHỮNG DÒNG NÀY
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handler - PHẢI Ở CUỐI CÙNG
app.use(errorMiddleware);

// ========== START SERVER ==========
const PORT = process.env.PORT || 6000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Local: http://localhost:${PORT}`);
  console.log(`🔗 Network: http://${HOST}:${PORT}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n📋 Test URLs:');
  console.log(`1. http://localhost:${PORT}`);
  console.log(`2. http://localhost:${PORT}/api/health`);
  console.log(`3. http://localhost:${PORT}/api/auth/test`);
  console.log(`4. http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`\n⚡ Use Ctrl+C to stop the server\n`);
});