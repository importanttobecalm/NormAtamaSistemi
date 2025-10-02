const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const AdminUser = require('../models/AdminUser');
const Teacher = require('../models/Teacher');
const { validateAdminLogin, validateTeacherLogin } = require('../middleware/validation');
const {
    generateAccessToken,
    generateRefreshToken,
    refreshAccessToken,
    blacklistToken,
    revokeRefreshToken,
    auditLog
} = require('../middleware/securityEnhanced');

// Admin login
router.post('/admin/login', validateAdminLogin, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find admin user
        const adminUser = await AdminUser.findByUsername(username);
        if (!adminUser) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Update last login
        await AdminUser.updateLastLogin(adminUser.id);

        // Generate tokens
        const accessToken = generateAccessToken({
            id: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            userType: 'admin'
        });

        const refreshToken = generateRefreshToken({
            id: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            userType: 'admin'
        });

        // Set secure HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: 'Giriş başarılı',
            token: accessToken, // Backward compatibility
            refreshToken,
            user: {
                id: adminUser.id,
                username: adminUser.username,
                role: adminUser.role,
                userType: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Teacher login
router.post('/teacher/login', validateTeacherLogin, async (req, res) => {
    try {
        const { tcId, birthDate } = req.body;

        // Find teacher
        const teacher = await Teacher.findByTcId(tcId);
        if (!teacher) {
            return res.status(401).json({ message: 'TC kimlik numarası veya doğum tarihi hatalı' });
        }

        // Convert birth date format (GG.AA.YYYY to YYYY-MM-DD)
        const [day, month, year] = birthDate.split('.');
        const formattedBirthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Check birth date (fix timezone issue)
        const date = new Date(teacher.birth_date);
        const dbYear = date.getFullYear();
        const dbMonth = String(date.getMonth() + 1).padStart(2, '0');
        const dbDay = String(date.getDate()).padStart(2, '0');
        const teacherBirthDate = `${dbYear}-${dbMonth}-${dbDay}`;
        if (teacherBirthDate !== formattedBirthDate) {
            return res.status(401).json({ message: 'TC kimlik numarası veya doğum tarihi hatalı' });
        }

        // Check password (birth date as password)
        const isPasswordValid = await bcrypt.compare(birthDate, teacher.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'TC kimlik numarası veya doğum tarihi hatalı' });
        }

        // Update last login
        await Teacher.updateLastLogin(teacher.tc_id);

        // Generate tokens
        const accessToken = generateAccessToken({
            tcId: teacher.tc_id,
            firstName: teacher.first_name,
            lastName: teacher.last_name,
            branch: teacher.branch,
            userType: 'teacher'
        });

        const refreshToken = generateRefreshToken({
            tcId: teacher.tc_id,
            firstName: teacher.first_name,
            lastName: teacher.last_name,
            branch: teacher.branch,
            userType: 'teacher'
        });

        // Set secure HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: 'Giriş başarılı',
            token: accessToken, // Backward compatibility
            refreshToken,
            user: {
                tcId: teacher.tc_id,
                firstName: teacher.first_name,
                lastName: teacher.last_name,
                branch: teacher.branch,
                placementPoints: teacher.placement_points,
                currentAssignment: teacher.current_assignment,
                userType: 'teacher'
            }
        });
    } catch (error) {
        console.error('Teacher login error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType === 'admin') {
            const adminUser = await AdminUser.findByUsername(decoded.username);
            if (!adminUser) {
                return res.status(401).json({ message: 'Geçersiz token' });
            }

            res.json({
                valid: true,
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    role: adminUser.role,
                    userType: 'admin'
                }
            });
        } else if (decoded.userType === 'teacher') {
            const teacher = await Teacher.findByTcId(decoded.tcId);
            if (!teacher) {
                return res.status(401).json({ message: 'Geçersiz token' });
            }

            res.json({
                valid: true,
                user: {
                    tcId: teacher.tc_id,
                    firstName: teacher.first_name,
                    lastName: teacher.last_name,
                    branch: teacher.branch,
                    placementPoints: teacher.placement_points,
                    currentAssignment: teacher.current_assignment,
                    userType: 'teacher'
                }
            });
        } else {
            res.status(401).json({ message: 'Geçersiz token' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token' });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token bulunamadı',
                code: 'NO_REFRESH_TOKEN'
            });
        }

        const result = refreshAccessToken(refreshToken);

        if (!result.success) {
            return res.status(401).json({
                message: 'Geçersiz refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Set new access token cookie
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.json({
            message: 'Token yenilendi',
            token: result.accessToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') ||
                     req.cookies?.accessToken;
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

        // Blacklist access token
        if (token) {
            blacklistToken(token);
        }

        // Revoke refresh token
        if (refreshToken) {
            revokeRefreshToken(refreshToken);
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            message: 'Çıkış başarılı'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;