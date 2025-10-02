const express = require('express');
const router = express.Router();

const Position = require('../../models/Position');
const { adminAuthMiddleware } = require('../../middleware/auth');
const { validatePosition } = require('../../middleware/validation');

// Get all positions with pagination and search
router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const branch = req.query.branch || '';
        const offset = (page - 1) * limit;

        const positions = await Position.getAll(limit, offset, search, branch);
        const totalCount = await Position.getCount(search, branch);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            positions,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching positions:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Pozisyonlar getirilirken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all branches
router.get('/branches', adminAuthMiddleware, async (req, res) => {
    try {
        const branches = await Position.getBranches();
        res.json(branches);
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Branşlar getirilirken hata oluştu' });
    }
});

// Get single position
router.get('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const position = await Position.findById(req.params.id);
        if (!position) {
            return res.status(404).json({ message: 'Pozisyon bulunamadı' });
        }

        res.json(position);
    } catch (error) {
        console.error('Error fetching position:', error);
        res.status(500).json({ message: 'Pozisyon getirilirken hata oluştu' });
    }
});

// Create new position
router.post('/', adminAuthMiddleware, validatePosition, async (req, res) => {
    try {
        const { schoolName, district, branch, quota } = req.body;

        const positionData = {
            schoolName,
            district,
            branch,
            quota: parseInt(quota)
        };

        const positionId = await Position.create(positionData);

        res.status(201).json({
            message: 'Pozisyon başarıyla eklendi',
            positionId
        });
    } catch (error) {
        console.error('Error creating position:', error);
        res.status(500).json({ message: 'Pozisyon eklenirken hata oluştu' });
    }
});

// Update position
router.put('/:id', adminAuthMiddleware, validatePosition, async (req, res) => {
    try {
        const { schoolName, district, branch, quota, status } = req.body;

        const updateData = {
            schoolName,
            district,
            branch,
            quota: parseInt(quota),
            status: status || 'active'
        };

        const updated = await Position.update(req.params.id, updateData);

        if (!updated) {
            return res.status(404).json({ message: 'Pozisyon bulunamadı' });
        }

        res.json({ message: 'Pozisyon başarıyla güncellendi' });
    } catch (error) {
        console.error('Error updating position:', error);
        res.status(500).json({ message: 'Pozisyon güncellenirken hata oluştu' });
    }
});

// Delete position
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const deleted = await Position.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Pozisyon bulunamadı' });
        }

        res.json({ message: 'Pozisyon başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting position:', error);
        res.status(500).json({ message: 'Pozisyon silinirken hata oluştu' });
    }
});

// Bulk import positions
router.post('/bulk-import', adminAuthMiddleware, async (req, res) => {
    try {
        const { positions } = req.body;

        if (!Array.isArray(positions) || positions.length === 0) {
            return res.status(400).json({ message: 'Geçerli pozisyon verisi gönderiniz' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const positionData of positions) {
            try {
                const { schoolName, district, branch, quota } = positionData;

                const data = {
                    schoolName,
                    district,
                    branch,
                    quota: parseInt(quota)
                };

                await Position.create(data);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    schoolName: positionData.schoolName,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Toplu içe aktarma tamamlandı',
            results
        });
    } catch (error) {
        console.error('Error bulk importing positions:', error);
        res.status(500).json({ message: 'Toplu içe aktarma sırasında hata oluştu' });
    }
});

module.exports = router;