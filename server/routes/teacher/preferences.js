const express = require('express');
const router = express.Router();

const Position = require('../../models/Position');
const Preference = require('../../models/Preference');
const PreferencePeriod = require('../../models/PreferencePeriod');
const { teacherAuthMiddleware } = require('../../middleware/auth');
const { validatePreferences } = require('../../middleware/validation');

// Get available positions for teacher's branch
router.get('/positions', teacherAuthMiddleware, async (req, res) => {
    try {
        const teacher = req.teacher;
        const positions = await Position.getByBranch(teacher.branch);

        res.json(positions);
    } catch (error) {
        console.error('Error fetching available positions:', error);
        res.status(500).json({ message: 'Mevcut pozisyonlar getirilirken hata oluştu' });
    }
});

// Get teacher's current preferences
router.get('/my-preferences', teacherAuthMiddleware, async (req, res) => {
    try {
        // Update period statuses first
        await PreferencePeriod.updateStatus();

        const activePeriod = await PreferencePeriod.getActivePeriod();
        if (!activePeriod) {
            return res.json({
                preferences: [],
                period: null,
                isActive: false,
                message: 'Aktif tercih dönemi bulunamadı'
            });
        }

        const preferences = await Preference.getByTeacherAndPeriod(req.user.tcId, activePeriod.id);

        // Check if preference time is still active
        const now = new Date();
        const isActive = new Date(activePeriod.start_date) <= now && new Date(activePeriod.end_date) >= now;

        res.json({
            preferences,
            period: activePeriod,
            isActive,
            canEdit: isActive && activePeriod.status === 'active'
        });
    } catch (error) {
        console.error('Error fetching teacher preferences:', error);
        res.status(500).json({ message: 'Tercihler getirilirken hata oluştu' });
    }
});

// Save teacher preferences
router.post('/save', teacherAuthMiddleware, validatePreferences, async (req, res) => {
    try {
        const { preferences } = req.body;

        // Check if preference period is active
        await PreferencePeriod.updateStatus();
        const activePeriod = await PreferencePeriod.getActivePeriod();

        if (!activePeriod) {
            return res.status(400).json({ message: 'Aktif tercih dönemi bulunamadı' });
        }

        const now = new Date();
        const isActive = new Date(activePeriod.start_date) <= now && new Date(activePeriod.end_date) >= now;

        if (!isActive || activePeriod.status !== 'active') {
            return res.status(400).json({ message: 'Tercih dönemi aktif değil' });
        }

        // Validate preferences
        if (preferences.length > 25) {
            return res.status(400).json({ message: 'En fazla 25 tercih yapılabilir' });
        }

        // Check for duplicate positions
        const positionIds = preferences.map(p => p.positionId);
        const uniquePositions = [...new Set(positionIds)];
        if (positionIds.length !== uniquePositions.length) {
            return res.status(400).json({ message: 'Aynı pozisyon birden fazla kez seçilemez' });
        }

        // Check for duplicate ranks
        const ranks = preferences.map(p => p.rank);
        const uniqueRanks = [...new Set(ranks)];
        if (ranks.length !== uniqueRanks.length) {
            return res.status(400).json({ message: 'Aynı sıra numarası birden fazla kez kullanılamaz' });
        }

        // Validate that all positions exist and are for teacher's branch
        const teacher = req.teacher;
        for (const pref of preferences) {
            const position = await Position.findById(pref.positionId);
            if (!position) {
                return res.status(400).json({ message: `Geçersiz pozisyon: ${pref.positionId}` });
            }
            if (position.branch !== teacher.branch) {
                return res.status(400).json({ message: 'Sadece kendi branşınıza ait pozisyonları seçebilirsiniz' });
            }
            if (position.status !== 'active') {
                return res.status(400).json({ message: 'Seçilen pozisyonlardan biri aktif değil' });
            }
        }

        // Save preferences
        await Preference.savePreferences(req.user.tcId, activePeriod.id, preferences);

        res.json({ message: 'Tercihler başarıyla kaydedildi' });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ message: 'Tercihler kaydedilirken hata oluştu' });
    }
});

// Get preference period status
router.get('/period-status', teacherAuthMiddleware, async (req, res) => {
    try {
        await PreferencePeriod.updateStatus();
        const activePeriod = await PreferencePeriod.getActivePeriod();

        if (!activePeriod) {
            return res.json({
                hasActivePeriod: false,
                period: null,
                isActive: false,
                timeRemaining: null
            });
        }

        const now = new Date();
        const endDate = new Date(activePeriod.end_date);
        const isActive = new Date(activePeriod.start_date) <= now && endDate >= now && activePeriod.status === 'active';
        const timeRemaining = isActive ? Math.max(0, endDate.getTime() - now.getTime()) : 0;

        res.json({
            hasActivePeriod: true,
            period: activePeriod,
            isActive,
            timeRemaining, // milliseconds
            canEdit: isActive
        });
    } catch (error) {
        console.error('Error fetching period status:', error);
        res.status(500).json({ message: 'Tercih dönemi durumu getirilirken hata oluştu' });
    }
});

module.exports = router;