const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { pool } = require('../../config/database');
const { adminAuthMiddleware } = require('../../middleware/auth');

// Export teachers and their preferences
router.get('/teachers/:periodId', adminAuthMiddleware, async (req, res) => {
    try {
        const { periodId } = req.params;

        // Get all teachers with their preferences
        const [teachers] = await pool.execute(`
            SELECT
                t.tc_id,
                t.first_name,
                t.last_name,
                t.branch,
                t.placement_points,
                t.current_assignment
            FROM teachers t
            WHERE EXISTS (
                SELECT 1 FROM preferences p
                WHERE p.teacher_tc_id = t.tc_id AND p.preference_period_id = ?
            )
            ORDER BY t.placement_points DESC
        `, [periodId]);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Öğretmenler ve Tercihler');

        // Build column headers array
        const columns = [
            { header: 'TC Kimlik', key: 'tc_id', width: 15 },
            { header: 'Ad', key: 'first_name', width: 15 },
            { header: 'Soyad', key: 'last_name', width: 15 },
            { header: 'Branş', key: 'branch', width: 15 },
            { header: 'Atama Puanı', key: 'placement_points', width: 12 },
            { header: 'Mevcut Atama', key: 'current_assignment', width: 30 }
        ];

        // Add preference columns (up to 25)
        for (let i = 1; i <= 25; i++) {
            columns.push({
                header: `Tercih ${i}`,
                key: `preference_${i}`,
                width: 30
            });
        }

        // Set columns
        worksheet.columns = columns;

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data rows
        for (const teacher of teachers) {
            // Get teacher's preferences
            const [preferences] = await pool.execute(`
                SELECT p.preference_rank, pos.school_name, pos.district
                FROM preferences p
                INNER JOIN positions pos ON p.position_id = pos.id
                WHERE p.teacher_tc_id = ? AND p.preference_period_id = ?
                ORDER BY p.preference_rank ASC
            `, [teacher.tc_id, periodId]);

            const row = {
                tc_id: teacher.tc_id,
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                branch: teacher.branch,
                placement_points: teacher.placement_points,
                current_assignment: teacher.current_assignment || ''
            };

            // Add preferences
            preferences.forEach(pref => {
                row[`preference_${pref.preference_rank}`] = `${pref.school_name} (${pref.district})`;
            });

            worksheet.addRow(row);
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ogretmenler_tercihler_${Date.now()}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export teachers error:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Rapor oluşturulurken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Export assignment results
router.get('/assignments/:periodId', adminAuthMiddleware, async (req, res) => {
    try {
        const { periodId } = req.params;

        // Get all assignments
        const [assignments] = await pool.execute(`
            SELECT
                t.tc_id,
                t.first_name,
                t.last_name,
                t.branch,
                t.placement_points,
                t.current_assignment,
                a.status,
                p.school_name as assigned_school,
                p.district as assigned_district,
                a.preference_rank,
                a.assigned_at
            FROM assignments a
            INNER JOIN teachers t ON a.teacher_tc_id = t.tc_id
            LEFT JOIN positions p ON a.position_id = p.id
            WHERE a.preference_period_id = ?
            ORDER BY a.status DESC, t.placement_points DESC
        `, [periodId]);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();

        // Sheet 1: Atanan Öğretmenler
        const assignedSheet = workbook.addWorksheet('Atanan Öğretmenler');
        assignedSheet.columns = [
            { header: 'TC Kimlik', key: 'tc_id', width: 15 },
            { header: 'Ad', key: 'first_name', width: 15 },
            { header: 'Soyad', key: 'last_name', width: 15 },
            { header: 'Branş', key: 'branch', width: 15 },
            { header: 'Atama Puanı', key: 'placement_points', width: 12 },
            { header: 'Atandığı Okul', key: 'assigned_school', width: 30 },
            { header: 'İlçe', key: 'assigned_district', width: 15 },
            { header: 'Tercih Sırası', key: 'preference_rank', width: 12 },
            { header: 'Atama Tarihi', key: 'assigned_at', width: 18 }
        ];

        // Sheet 2: Açıkta Kalan Öğretmenler
        const unassignedSheet = workbook.addWorksheet('Açıkta Kalan Öğretmenler');
        unassignedSheet.columns = [
            { header: 'TC Kimlik', key: 'tc_id', width: 15 },
            { header: 'Ad', key: 'first_name', width: 15 },
            { header: 'Soyad', key: 'last_name', width: 15 },
            { header: 'Branş', key: 'branch', width: 15 },
            { header: 'Atama Puanı', key: 'placement_points', width: 12 },
            { header: 'Mevcut Atama', key: 'current_assignment', width: 30 }
        ];

        // Style headers
        [assignedSheet, unassignedSheet].forEach(sheet => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
        });

        // Add data
        assignments.forEach(assignment => {
            if (assignment.status === 'assigned') {
                assignedSheet.addRow({
                    tc_id: assignment.tc_id,
                    first_name: assignment.first_name,
                    last_name: assignment.last_name,
                    branch: assignment.branch,
                    placement_points: assignment.placement_points,
                    assigned_school: assignment.assigned_school,
                    assigned_district: assignment.assigned_district,
                    preference_rank: assignment.preference_rank,
                    assigned_at: assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleString('tr-TR') : ''
                });
            } else {
                unassignedSheet.addRow({
                    tc_id: assignment.tc_id,
                    first_name: assignment.first_name,
                    last_name: assignment.last_name,
                    branch: assignment.branch,
                    placement_points: assignment.placement_points,
                    current_assignment: assignment.current_assignment || ''
                });
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=atama_sonuclari_${Date.now()}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export assignments error:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Rapor oluşturulurken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Export positions status
router.get('/positions/:periodId', adminAuthMiddleware, async (req, res) => {
    try {
        const { periodId } = req.params;

        // Get positions with fill status
        const [positions] = await pool.execute(`
            SELECT
                p.id,
                p.school_name,
                p.district,
                p.branch,
                p.quota,
                COUNT(a.id) as filled_count,
                p.status
            FROM positions p
            LEFT JOIN assignments a ON p.id = a.position_id AND a.preference_period_id = ? AND a.status = 'assigned'
            GROUP BY p.id
            ORDER BY p.school_name
        `, [periodId]);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pozisyon Durumları');

        worksheet.columns = [
            { header: 'Okul Adı', key: 'school_name', width: 30 },
            { header: 'İlçe', key: 'district', width: 15 },
            { header: 'Branş', key: 'branch', width: 15 },
            { header: 'Kontenjan', key: 'quota', width: 12 },
            { header: 'Doluluk', key: 'filled_count', width: 12 },
            { header: 'Boş Kontenjan', key: 'remaining', width: 12 },
            { header: 'Durum', key: 'status', width: 12 }
        ];

        // Style header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data
        positions.forEach(pos => {
            worksheet.addRow({
                school_name: pos.school_name,
                district: pos.district,
                branch: pos.branch,
                quota: pos.quota,
                filled_count: pos.filled_count,
                remaining: pos.quota - pos.filled_count,
                status: pos.status === 'active' ? 'Aktif' : 'Pasif'
            });
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=pozisyon_durumlari_${Date.now()}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export positions error:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Rapor oluşturulurken hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
