const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const AdminUser = require('../models/AdminUser');
const Teacher = require('../models/Teacher');
const { validateAdminLogin, validateTeacherLogin } = require('../middleware/validation');

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

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

        // Generate token
        const token = generateToken({
            id: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            userType: 'admin'
        });

        res.json({
            message: 'Giriş başarılı',
            token,
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

        // Generate token
        const token = generateToken({
            tcId: teacher.tc_id,
            firstName: teacher.first_name,
            lastName: teacher.last_name,
            branch: teacher.branch,
            userType: 'teacher'
        });

        res.json({
            message: 'Giriş başarılı',
            token,
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

module.exports = router;