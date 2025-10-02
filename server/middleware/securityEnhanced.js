const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory token blacklist (production'da Redis kullanılmalı)
const tokenBlacklist = new Set();
const refreshTokens = new Map(); // refreshToken -> { userId, userType, createdAt }

// Token blacklist kontrolü
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

// Token'ı blacklist'e ekle
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // 24 saat sonra otomatik temizle
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 24 * 60 * 60 * 1000);
};

// Access token oluştur (kısa ömürlü - 15 dakika)
const generateAccessToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            tokenId: uuidv4(), // Her token için benzersiz ID
            type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// Refresh token oluştur (uzun ömürlü - 7 gün)
const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(
        {
            userId: payload.id || payload.tcId,
            userType: payload.userType,
            tokenId: uuidv4(),
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
        { expiresIn: '7d' }
    );

    // Refresh token'ı sakla
    refreshTokens.set(refreshToken, {
        userId: payload.id || payload.tcId,
        userType: payload.userType,
        createdAt: Date.now()
    });

    // 7 gün sonra otomatik temizle
    setTimeout(() => {
        refreshTokens.delete(refreshToken);
    }, 7 * 24 * 60 * 60 * 1000);

    return refreshToken;
};

// Refresh token doğrula ve yeni access token oluştur
const refreshAccessToken = (refreshToken) => {
    try {
        // Refresh token geçerli mi kontrol et
        if (!refreshTokens.has(refreshToken)) {
            throw new Error('Invalid refresh token');
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        const tokenData = refreshTokens.get(refreshToken);

        // Yeni access token oluştur
        const newAccessToken = generateAccessToken({
            id: decoded.userId,
            tcId: decoded.userId,
            userType: decoded.userType
        });

        return { success: true, accessToken: newAccessToken };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Refresh token iptal et
const revokeRefreshToken = (refreshToken) => {
    refreshTokens.delete(refreshToken);
};

// Gelişmiş token doğrulama middleware
const enhancedAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') ||
                     req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: 'Erişim reddedildi. Token bulunamadı.',
                code: 'NO_TOKEN'
            });
        }

        // Blacklist kontrolü
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({
                message: 'Token geçersiz kılındı.',
                code: 'TOKEN_REVOKED'
            });
        }

        // Token doğrulama
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Token tipi kontrolü
        if (decoded.type !== 'access') {
            return res.status(401).json({
                message: 'Geçersiz token tipi.',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // Request'e kullanıcı bilgisi ekle
        req.user = decoded;
        req.token = token;

        // Güvenlik logları için
        req.securityContext = {
            userId: decoded.id || decoded.tcId,
            userType: decoded.userType,
            tokenId: decoded.tokenId,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token süresi doldu. Lütfen yeniden giriş yapın.',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            message: 'Geçersiz token.',
            code: 'INVALID_TOKEN'
        });
    }
};

// Audit log için middleware
const auditLog = (action) => {
    return (req, res, next) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            userId: req.securityContext?.userId,
            userType: req.securityContext?.userType,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            path: req.path,
            method: req.method
        };

        // Production'da bu loglar veritabanına veya log servisine yazılmalı
        console.log('[AUDIT]', JSON.stringify(logEntry));

        next();
    };
};

// Suspicious activity detection
const detectSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /(\bor\b|\band\b).*=.*--/i,  // SQL injection patterns
        /<script|javascript:|onerror=/i,  // XSS patterns
        /\.\.\/|\.\.\\/, // Path traversal
    ];

    const checkString = `${req.url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)}`;

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            console.error('[SECURITY] Suspicious activity detected:', {
                ip: req.ip,
                url: req.url,
                pattern: pattern.toString()
            });

            return res.status(400).json({
                message: 'Şüpheli aktivite tespit edildi.',
                code: 'SUSPICIOUS_ACTIVITY'
            });
        }
    }

    next();
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    refreshAccessToken,
    blacklistToken,
    revokeRefreshToken,
    isTokenBlacklisted,
    enhancedAuthMiddleware,
    auditLog,
    detectSuspiciousActivity
};
