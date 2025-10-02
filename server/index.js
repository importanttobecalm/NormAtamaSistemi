const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { detectSuspiciousActivity } = require('./middleware/securityEnhanced');

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

// HTTPS redirect middleware (production only)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Cookie parser - HTTPS-only cookies için
app.use(cookieParser());

// Security middleware - React için optimize edilmiş güvenlik başlıkları
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // React için gerekli
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    } : false,
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    } : false,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' }
}));

// HTTP Parameter Pollution koruması
app.use(hpp());

// XSS koruması için ek header
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per windowMs
    message: 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyiniz.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Rate limiting for login endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login attempts per windowMs
    message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyiniz.',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://normatamasistemi-production.up.railway.app', 'http://localhost:3000']
        : ['http://localhost:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb', charset: 'utf8' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', charset: 'utf8' }));

// Set default charset only for API routes
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// Şüpheli aktivite tespiti
app.use(detectSuspiciousActivity);

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
    // Docker path: /app/client/build, Local path: ../client/build
    const clientBuildPath = path.join(__dirname, '../client/build');

    console.log('📁 Serving static files from:', clientBuildPath);
    app.use(express.static(clientBuildPath));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        const indexPath = path.join(clientBuildPath, 'index.html');
        console.log('📄 Sending index.html from:', indexPath);
        res.sendFile(indexPath);
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
