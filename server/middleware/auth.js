const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const Teacher = require('../models/Teacher');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token.' });
    }
};

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType !== 'admin') {
            return res.status(403).json({ message: 'Yönetici yetkisi gerekli.' });
        }

        const adminUser = await AdminUser.findByUsername(decoded.username);
        if (!adminUser) {
            return res.status(401).json({ message: 'Yönetici bulunamadı.' });
        }

        req.user = decoded;
        req.adminUser = adminUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token.' });
    }
};

const teacherAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType !== 'teacher') {
            return res.status(403).json({ message: 'Öğretmen yetkisi gerekli.' });
        }

        const teacher = await Teacher.findByTcId(decoded.tcId);
        if (!teacher) {
            return res.status(401).json({ message: 'Öğretmen bulunamadı.' });
        }

        req.user = decoded;
        req.teacher = teacher;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token.' });
    }
};

module.exports = {
    authMiddleware,
    adminAuthMiddleware,
    teacherAuthMiddleware
};