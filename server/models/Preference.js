const { pool } = require('../config/database');

class Preference {
    static async getByTeacherAndPeriod(teacherTcId, periodId) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.*, pos.school_name, pos.district, pos.branch
                 FROM preferences p
                 JOIN positions pos ON p.position_id = pos.id
                 WHERE p.teacher_tc_id = ? AND p.preference_period_id = ?
                 ORDER BY p.preference_rank ASC`,
                [teacherTcId, periodId]
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching preferences: ${error.message}`);
        }
    }

    static async savePreferences(teacherTcId, periodId, preferences) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Delete existing preferences for this teacher and period
            await connection.execute(
                'DELETE FROM preferences WHERE teacher_tc_id = ? AND preference_period_id = ?',
                [teacherTcId, periodId]
            );

            // Insert new preferences
            if (preferences.length > 0) {
                const values = preferences.map(pref => [teacherTcId, pref.positionId, pref.rank, periodId]);
                const placeholders = preferences.map(() => '(?, ?, ?, ?)').join(', ');

                await connection.execute(
                    `INSERT INTO preferences (teacher_tc_id, position_id, preference_rank, preference_period_id)
                     VALUES ${placeholders}`,
                    values.flat()
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error saving preferences: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    static async getAllByPeriod(periodId) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.*, t.first_name, t.last_name, t.placement_points, pos.school_name, pos.district
                 FROM preferences p
                 JOIN teachers t ON p.teacher_tc_id = t.tc_id
                 JOIN positions pos ON p.position_id = pos.id
                 WHERE p.preference_period_id = ?
                 ORDER BY t.placement_points DESC, t.last_name ASC, p.preference_rank ASC`,
                [periodId]
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching all preferences: ${error.message}`);
        }
    }

    static async getTeacherPreferenceCount(teacherTcId, periodId) {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM preferences WHERE teacher_tc_id = ? AND preference_period_id = ?',
                [teacherTcId, periodId]
            );
            return rows[0].count;
        } catch (error) {
            throw new Error(`Error getting preference count: ${error.message}`);
        }
    }

    static async getPreferenceStats(periodId) {
        try {
            const [rows] = await pool.execute(
                `SELECT
                    COUNT(DISTINCT teacher_tc_id) as teachers_with_preferences,
                    COUNT(*) as total_preferences,
                    AVG(preference_count) as avg_preferences_per_teacher
                 FROM (
                    SELECT teacher_tc_id, COUNT(*) as preference_count
                    FROM preferences
                    WHERE preference_period_id = ?
                    GROUP BY teacher_tc_id
                 ) as teacher_stats`,
                [periodId]
            );
            return rows[0];
        } catch (error) {
            throw new Error(`Error getting preference statistics: ${error.message}`);
        }
    }
}

module.exports = Preference;