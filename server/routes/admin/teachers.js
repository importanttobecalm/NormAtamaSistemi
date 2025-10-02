const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const Teacher = require('../../models/Teacher');
const { adminAuthMiddleware } = require('../../middleware/auth');
const { validateTeacher } = require('../../middleware/validation');

// Get all teachers with pagination and search
router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const teachers = await Teacher.getAll(limit, offset, search);
        const totalCount = await Teacher.getCount(search);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            teachers,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Öğretmenler getirilirken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get single teacher
router.get('/:tcId', adminAuthMiddleware, async (req, res) => {
    try {
        const teacher = await Teacher.findByTcId(req.params.tcId);
        if (!teacher) {
            return res.status(404).json({ message: 'Öğretmen bulunamadı' });
        }

        // Remove password hash from response
        const { password_hash, ...teacherData } = teacher;
        res.json(teacherData);
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Öğretmen getirilirken hata oluştu' });
    }
});

// Create new teacher
router.post('/', adminAuthMiddleware, validateTeacher, async (req, res) => {
    try {
        const { tcId, firstName, lastName, birthDate, placementPoints, branch, currentAssignment } = req.body;

        // Convert birth date format (GG.AA.YYYY to YYYY-MM-DD for hashing)
        const [day, month, year] = birthDate.split('T')[0].split('-').reverse();
        const formattedBirthDate = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;

        // Hash the birth date as password
        const passwordHash = await bcrypt.hash(formattedBirthDate, 10);

        const teacherData = {
            tcId,
            firstName,
            lastName,
            birthDate,
            placementPoints: parseFloat(placementPoints),
            branch,
            currentAssignment: currentAssignment || '',
            passwordHash
        };

        const teacherId = await Teacher.create(teacherData);

        res.status(201).json({
            message: 'Öğretmen başarıyla eklendi',
            teacherId,
            defaultPassword: formattedBirthDate
        });
    } catch (error) {
        console.error('Error creating teacher:', error);
        if (error.message.includes('zaten mevcut')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Öğretmen eklenirken hata oluştu' });
        }
    }
});

// Update teacher
router.put('/:tcId', adminAuthMiddleware, validateTeacher, async (req, res) => {
    try {
        const { firstName, lastName, birthDate, placementPoints, branch, currentAssignment } = req.body;

        const updateData = {
            firstName,
            lastName,
            birthDate,
            placementPoints: parseFloat(placementPoints),
            branch,
            currentAssignment: currentAssignment || ''
        };

        const updated = await Teacher.update(req.params.tcId, updateData);

        if (!updated) {
            return res.status(404).json({ message: 'Öğretmen bulunamadı' });
        }

        res.json({ message: 'Öğretmen bilgileri başarıyla güncellendi' });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Öğretmen güncellenirken hata oluştu' });
    }
});

// Delete teacher
router.delete('/:tcId', adminAuthMiddleware, async (req, res) => {
    try {
        const deleted = await Teacher.delete(req.params.tcId);

        if (!deleted) {
            return res.status(404).json({ message: 'Öğretmen bulunamadı' });
        }

        res.json({ message: 'Öğretmen başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Öğretmen silinirken hata oluştu' });
    }
});

// Bulk import teachers
router.post('/bulk-import', adminAuthMiddleware, async (req, res) => {
    try {
        const { teachers } = req.body;

        if (!Array.isArray(teachers) || teachers.length === 0) {
            return res.status(400).json({ message: 'Geçerli öğretmen verisi gönderiniz' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const teacherData of teachers) {
            try {
                const { tcId, firstName, lastName, birthDate, placementPoints, branch, currentAssignment } = teacherData;

                // Convert birth date format for password
                const birthDateObj = new Date(birthDate);
                const formattedBirthDate = `${birthDateObj.getDate().toString().padStart(2, '0')}.${(birthDateObj.getMonth() + 1).toString().padStart(2, '0')}.${birthDateObj.getFullYear()}`;

                const passwordHash = await bcrypt.hash(formattedBirthDate, 10);

                const data = {
                    tcId,
                    firstName,
                    lastName,
                    birthDate,
                    placementPoints: parseFloat(placementPoints),
                    branch,
                    currentAssignment: currentAssignment || '',
                    passwordHash
                };

                await Teacher.create(data);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    tcId: teacherData.tcId,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Toplu içe aktarma tamamlandı',
            results
        });
    } catch (error) {
        console.error('Error bulk importing teachers:', error);
        res.status(500).json({ message: 'Toplu içe aktarma sırasında hata oluştu' });
    }
});

module.exports = router;