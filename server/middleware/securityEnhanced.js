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
    detectSuspiciousActivity
};
