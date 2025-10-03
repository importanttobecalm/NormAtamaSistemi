const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// DANGER: This endpoint should be removed after initial setup!
router.get('/initialize', async (req, res) => {
    try {
        // Create admin user if not exists
        const [existingAdmin] = await pool.execute(
            'SELECT id FROM admin_users WHERE username = ?',
            ['admin']
        );

        if (existingAdmin.length === 0) {
            const adminPasswordHash = await bcrypt.hash('admin123', 10);
            await pool.execute(
                `INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)`,
                ['admin', adminPasswordHash, 'admin']
            );
        }

        // Create sample teachers
        const sampleTeachers = [
            { tcId: '12345678901', firstName: 'Ahmet', lastName: 'Yılmaz', birthDate: '1985-05-15', points: 85.5, branch: 'Matematik' },
            { tcId: '12345678902', firstName: 'Ayşe', lastName: 'Demir', birthDate: '1982-03-22', points: 92.3, branch: 'Türkçe' },
            { tcId: '12345678903', firstName: 'Mehmet', lastName: 'Kaya', birthDate: '1988-11-08', points: 78.9, branch: 'İngilizce' }
        ];

        for (const teacher of sampleTeachers) {
            const [existing] = await pool.execute(
                'SELECT tc_id FROM teachers WHERE tc_id = ?',
                [teacher.tcId]
            );

            if (existing.length === 0) {
                // Password is birth date in DD.MM.YYYY format
                const birthDateParts = teacher.birthDate.split('-');
                const password = `${birthDateParts[2]}.${birthDateParts[1]}.${birthDateParts[0]}`;
                const passwordHash = await bcrypt.hash(password, 10);

                await pool.execute(
                    `INSERT INTO teachers (tc_id, first_name, last_name, birth_date, placement_points, branch, password_hash)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [teacher.tcId, teacher.firstName, teacher.lastName, teacher.birthDate, teacher.points, teacher.branch, passwordHash]
                );
            }
        }

        // Get counts
        const [adminCount] = await pool.execute('SELECT COUNT(*) as count FROM admin_users');
        const [teacherCount] = await pool.execute('SELECT COUNT(*) as count FROM teachers');
        const [positionCount] = await pool.execute('SELECT COUNT(*) as count FROM positions');

        res.json({
            success: true,
            message: 'Database initialized successfully',
            stats: {
                admins: adminCount[0].count,
                teachers: teacherCount[0].count,
                positions: positionCount[0].count
            }
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization failed',
            error: error.message
        });
    }
});

module.exports = router;
