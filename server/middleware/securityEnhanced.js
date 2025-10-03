const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// In-memory token blacklist for access tokens (production'da Redis kullanılmalı)
const tokenBlacklist = new Set();

// Token blacklist kontrolü
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

// Token'ı blacklist'e ekle
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // 15 dakika sonra otomatik temizle (access token ömrü kadar)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 15 * 60 * 1000);
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

// Refresh token oluştur ve veritabanına kaydet (uzun ömürlü - 7 gün)
const generateRefreshToken = async (payload) => {
    const userId = payload.id || payload.tcId;
    if (!userId) throw new Error('User ID is required to generate a refresh token');

    const refreshToken = jwt.sign(
        {
            userId: userId,
            userType: payload.userType,
            tokenId: uuidv4(),
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
        { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(
        'INSERT INTO refresh_tokens (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)',
        [userId, payload.userType, refreshToken, expiresAt]
    );

    return refreshToken;
};

// Refresh token doğrula ve yeni access token oluştur
const refreshAccessToken = async (refreshToken) => {
    try {
        // Refresh token veritabanında var mı ve süresi geçerli mi kontrol et
        const [rows] = await pool.execute(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
            [refreshToken]
        );

        const storedToken = rows[0];
        if (!storedToken) {
            // Geçersiz veya süresi dolmuş token'ları temizle
            if (rows[0]) {
                await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
            }
            throw new Error('Invalid or expired refresh token');
        }

        // JWT'yi doğrula
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        // Yeni access token oluştur
        const newAccessToken = generateAccessToken({
            id: decoded.userId,
            tcId: decoded.userId,
            userType: decoded.userType
        });

        return { success: true, accessToken: newAccessToken };
    } catch (error) {
        console.error('Error refreshing access token:', error.message);
        return { success: false, error: error.message };
    }
};

// Refresh token iptal et (veritabanından sil)
const revokeRefreshToken = async (refreshToken) => {
    if (!refreshToken) return;
    try {
        await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    } catch (error) {
        console.error('Error revoking refresh token:', error.message);
    }
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
