const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminTeacherRoutes = require('./routes/admin/teachers');
const adminPositionRoutes = require('./routes/admin/positions');
const adminPeriodRoutes = require('./routes/admin/periods');
const adminImportRoutes = require('./routes/admin/import');
const adminAssignmentRoutes = require('./routes/admin/assignments');
const adminReportRoutes = require('./routes/admin/reports');
const teacherProfileRoutes = require('./routes/teacher/profile');
const teacherPreferenceRoutes = require('./routes/teacher/preferences');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - needed for rate limiting to work correctly
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyiniz.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Stricter rate limiting for login endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyiniz.',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['http://localhost:3000'] // Add your production domain here
        : ['http://localhost:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb', charset: 'utf8' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', charset: 'utf8' }));

// Set default charset for responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/admin/teachers', adminTeacherRoutes);
app.use('/api/admin/positions', adminPositionRoutes);
app.use('/api/admin/periods', adminPeriodRoutes);
app.use('/api/admin/import', adminImportRoutes);
app.use('/api/admin/assignments', adminAssignmentRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/teacher/profile', teacherProfileRoutes);
app.use('/api/teacher/preferences', teacherPreferenceRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
} else {
    // 404 handler for development
    app.use('*', (req, res) => {
        res.status(404).json({ message: 'Endpoint bulunamadı' });
    });
}

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    res.status(error.status || 500).json({
        message: error.message || 'Sunucu hatası',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Database connection failed. Server not started.');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

startServer();
