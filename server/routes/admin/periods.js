const express = require('express');
const router = express.Router();

const PreferencePeriod = require('../../models/PreferencePeriod');
const Preference = require('../../models/Preference');
const { adminAuthMiddleware } = require('../../middleware/auth');
const { validatePreferencePeriod } = require('../../middleware/validation');

// Get all preference periods
router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        const periods = await PreferencePeriod.getAll();
        res.json(periods);
    } catch (error) {
        console.error('Error fetching preference periods:', error);
        res.status(500).json({ message: 'Tercih dönemleri getirilirken hata oluştu' });
    }
});

// Get current/active period
router.get('/current', adminAuthMiddleware, async (req, res) => {
    try {
        // Update period statuses first
        await PreferencePeriod.updateStatus();

        const currentPeriod = await PreferencePeriod.getCurrentPeriod();
        res.json(currentPeriod);
    } catch (error) {
        console.error('Error fetching current period:', error);
        res.status(500).json({ message: 'Mevcut tercih dönemi getirilirken hata oluştu' });
    }
});

// Get single preference period
router.get('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const period = await PreferencePeriod.findById(req.params.id);
        if (!period) {
            return res.status(404).json({ message: 'Tercih dönemi bulunamadı' });
        }

        res.json(period);
    } catch (error) {
        console.error('Error fetching preference period:', error);
        res.status(500).json({ message: 'Tercih dönemi getirilirken hata oluştu' });
    }
});

// Create new preference period
router.post('/', adminAuthMiddleware, validatePreferencePeriod, async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const periodData = {
            startDate,
            endDate,
            createdBy: req.adminUser.id
        };

        const periodId = await PreferencePeriod.create(periodData);

        res.status(201).json({
            message: 'Tercih dönemi başarıyla oluşturuldu',
            periodId
        });
    } catch (error) {
        console.error('Error creating preference period:', error);
        res.status(500).json({ message: 'Tercih dönemi oluşturulurken hata oluştu' });
    }
});

// Update preference period
router.put('/:id', adminAuthMiddleware, validatePreferencePeriod, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.body;

        const updateData = {
            startDate,
            endDate,
            status: status || 'upcoming'
        };

        const updated = await PreferencePeriod.update(req.params.id, updateData);

        if (!updated) {
            return res.status(404).json({ message: 'Tercih dönemi bulunamadı' });
        }

        res.json({ message: 'Tercih dönemi başarıyla güncellendi' });
    } catch (error) {
        console.error('Error updating preference period:', error);
        res.status(500).json({ message: 'Tercih dönemi güncellenirken hata oluştu' });
    }
});

// Delete preference period
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const deleted = await PreferencePeriod.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Tercih dönemi bulunamadı' });
        }

        res.json({ message: 'Tercih dönemi başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting preference period:', error);
        res.status(500).json({ message: 'Tercih dönemi silinirken hata oluştu' });
    }
});

// Get all preferences for a period
router.get('/:id/preferences', adminAuthMiddleware, async (req, res) => {
    try {
        const preferences = await Preference.getAllByPeriod(req.params.id);
        const stats = await Preference.getPreferenceStats(req.params.id);

        res.json({
            preferences,
            stats
        });
    } catch (error) {
        console.error('Error fetching period preferences:', error);
        res.status(500).json({ message: 'Dönem tercihleri getirilirken hata oluştu' });
    }
});

// Update period status manually
router.patch('/:id/status', adminAuthMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['upcoming', 'active', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri' });
        }

        const period = await PreferencePeriod.findById(req.params.id);
        if (!period) {
            return res.status(404).json({ message: 'Tercih dönemi bulunamadı' });
        }

        const updated = await PreferencePeriod.update(req.params.id, {
            startDate: period.start_date,
            endDate: period.end_date,
            status
        });

        if (!updated) {
            return res.status(404).json({ message: 'Tercih dönemi güncellenemedi' });
        }

        res.json({ message: 'Tercih dönemi durumu başarıyla güncellendi' });
    } catch (error) {
        console.error('Error updating period status:', error);
        res.status(500).json({ message: 'Tercih dönemi durumu güncellenirken hata oluştu' });
    }
});

module.exports = router;