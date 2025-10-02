const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { adminAuthMiddleware } = require('../../middleware/auth');

// Assignment algorithm: Match teachers to positions based on preferences and points
async function runAssignmentAlgorithm(periodId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get all teachers with their preferences for this period, ordered by points (highest first)
        const [teachers] = await connection.execute(`
            SELECT DISTINCT
                t.tc_id,
                t.first_name,
                t.last_name,
                t.placement_points,
                t.branch
            FROM teachers t
            INNER JOIN preferences p ON t.tc_id = p.teacher_tc_id
            WHERE p.preference_period_id = ?
            ORDER BY t.placement_points DESC, t.tc_id ASC
        `, [periodId]);

        // Get all active positions with remaining quotas
        const [positions] = await connection.execute(`
            SELECT
                p.id,
                p.school_name,
                p.district,
                p.branch,
                p.quota,
                COALESCE(
                    (SELECT COUNT(*)
                     FROM assignments a
                     WHERE a.position_id = p.id
                     AND a.preference_period_id = ?
                     AND a.status = 'assigned'),
                    0
                ) as assigned_count
            FROM positions p
            WHERE p.status = 'active'
        `, [periodId]);

        // Create a map of positions with remaining quotas
        const positionMap = {};
        positions.forEach(pos => {
            positionMap[pos.id] = {
                ...pos,
                remainingQuota: pos.quota - pos.assigned_count
            };
        });

        let assignedCount = 0;
        let unassignedCount = 0;

        // Process each teacher in order of placement points
        for (const teacher of teachers) {
            // Get teacher's preferences in rank order
            const [preferences] = await connection.execute(`
                SELECT position_id, preference_rank
                FROM preferences
                WHERE teacher_tc_id = ? AND preference_period_id = ?
                ORDER BY preference_rank ASC
            `, [teacher.tc_id, periodId]);

            let assigned = false;

            // Try to assign to highest ranked available position
            for (const pref of preferences) {
                const position = positionMap[pref.position_id];

                if (position && position.remainingQuota > 0 && position.branch === teacher.branch) {
                    // Assign teacher to this position
                    await connection.execute(`
                        INSERT INTO assignments
                        (teacher_tc_id, position_id, preference_period_id, preference_rank, placement_points, status, assigned_at)
                        VALUES (?, ?, ?, ?, ?, 'assigned', NOW())
                        ON DUPLICATE KEY UPDATE
                        position_id = VALUES(position_id),
                        preference_rank = VALUES(preference_rank),
                        status = 'assigned',
                        assigned_at = NOW()
                    `, [teacher.tc_id, position.id, periodId, pref.preference_rank, teacher.placement_points]);

                    // Decrease remaining quota
                    position.remainingQuota--;
                    assigned = true;
                    assignedCount++;
                    break;
                }
            }

            if (!assigned) {
                // Mark as unassigned
                await connection.execute(`
                    INSERT INTO assignments
                    (teacher_tc_id, position_id, preference_period_id, preference_rank, placement_points, status)
                    VALUES (?, NULL, ?, NULL, ?, 'unassigned')
                    ON DUPLICATE KEY UPDATE
                    position_id = NULL,
                    preference_rank = NULL,
                    status = 'unassigned'
                `, [teacher.tc_id, periodId, teacher.placement_points]);
                unassignedCount++;
            }
        }

        await connection.commit();

        return {
            success: true,
            assignedCount,
            unassignedCount,
            totalTeachers: teachers.length
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Run automatic assignment for a preference period
router.post('/run/:periodId', adminAuthMiddleware, async (req, res) => {
    try {
        const { periodId } = req.params;

        // Check if period exists and is completed
        const [periods] = await pool.execute(
            'SELECT id, status, end_date FROM preference_periods WHERE id = ?',
            [periodId]
        );

        if (periods.length === 0) {
            return res.status(404).json({ message: 'Tercih dönemi bulunamadı' });
        }

        const period = periods[0];
        const now = new Date();
        const endDate = new Date(period.end_date);

        if (now < endDate) {
            return res.status(400).json({ message: 'Tercih dönemi henüz bitmedi' });
        }

        // Run assignment algorithm
        const result = await runAssignmentAlgorithm(periodId);

        res.json({
            message: 'Atama işlemi tamamlandı',
            ...result
        });
    } catch (error) {
        console.error('Assignment error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Get assignment statistics for a period
router.get('/statistics/:periodId', adminAuthMiddleware, async (req, res) => {
    try {
        const { periodId } = req.params;

        // Get assigned teachers with their assignments
        const [assigned] = await pool.execute(`
            SELECT
                t.tc_id,
                t.first_name,
                t.last_name,
                t.branch,
                t.placement_points,
                p.school_name,
                p.district,
                a.preference_rank,
                a.assigned_at
            FROM assignments a
            INNER JOIN teachers t ON a.teacher_tc_id = t.tc_id
            INNER JOIN positions p ON a.position_id = p.id
            WHERE a.preference_period_id = ? AND a.status = 'assigned'
            ORDER BY t.placement_points DESC
        `, [periodId]);

        // Get unassigned teachers
        const [unassigned] = await pool.execute(`
            SELECT
                t.tc_id,
                t.first_name,
                t.last_name,
                t.branch,
                t.placement_points
            FROM assignments a
            INNER JOIN teachers t ON a.teacher_tc_id = t.tc_id
            WHERE a.preference_period_id = ? AND a.status = 'unassigned'
            ORDER BY t.placement_points DESC
        `, [periodId]);

        // Get position fill rates
        const [positionStats] = await pool.execute(`
            SELECT
                p.id,
                p.school_name,
                p.district,
                p.branch,
                p.quota,
                COUNT(a.id) as filled_count
            FROM positions p
            LEFT JOIN assignments a ON p.id = a.position_id AND a.preference_period_id = ? AND a.status = 'assigned'
            WHERE p.status = 'active'
            GROUP BY p.id
            ORDER BY p.school_name
        `, [periodId]);

        res.json({
            assigned,
            unassigned,
            positionStats,
            summary: {
                totalAssigned: assigned.length,
                totalUnassigned: unassigned.length,
                totalPositions: positionStats.length,
                filledPositions: positionStats.filter(p => p.filled_count >= p.quota).length
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Get all assignments for a period
router.get('/:periodId', adminAuthMiddleware, async (req, res) => {
    try {
        const { periodId } = req.params;

        const [assignments] = await pool.execute(`
            SELECT
                a.id,
                a.teacher_tc_id,
                t.first_name,
                t.last_name,
                t.branch,
                t.placement_points,
                a.position_id,
                p.school_name,
                p.district,
                a.preference_rank,
                a.status,
                a.assigned_at
            FROM assignments a
            INNER JOIN teachers t ON a.teacher_tc_id = t.tc_id
            LEFT JOIN positions p ON a.position_id = p.id
            WHERE a.preference_period_id = ?
            ORDER BY a.status DESC, t.placement_points DESC
        `, [periodId]);

        res.json(assignments);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
