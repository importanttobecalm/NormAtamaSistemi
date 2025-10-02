const express = require('express');
const router = express.Router();

const Teacher = require('../../models/Teacher');
const { teacherAuthMiddleware } = require('../../middleware/auth');

// Get teacher profile information
router.get('/info', teacherAuthMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findByTcId(req.user.tcId);
        if (!teacher) {
            return res.status(404).json({ message: 'Öğretmen bulunamadı' });
        }

        // Remove password hash from response
        const { password_hash, ...teacherData } = teacher;

        res.json({
            tcId: teacherData.tc_id,
            firstName: teacherData.first_name,
            lastName: teacherData.last_name,
            birthDate: teacherData.birth_date,
            placementPoints: teacherData.placement_points,
            branch: teacherData.branch,
            currentAssignment: teacherData.current_assignment,
            createdAt: teacherData.created_at,
            lastLogin: teacherData.last_login
        });
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({ message: 'Profil bilgileri getirilirken hata oluştu' });
    }
});

module.exports = router;