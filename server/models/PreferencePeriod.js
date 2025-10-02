const { pool } = require('../config/database');

class PreferencePeriod {
    static async create(periodData) {
        const { startDate, endDate, createdBy } = periodData;

        try {
            const [result] = await pool.execute(
                `INSERT INTO preference_periods (start_date, end_date, created_by)
                 VALUES (?, ?, ?)`,
                [startDate, endDate, createdBy]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating preference period: ${error.message}`);
        }
    }

    static async getAll() {
        try {
            const [rows] = await pool.execute(
                `SELECT pp.*, au.username as created_by_username
                 FROM preference_periods pp
                 LEFT JOIN admin_users au ON pp.created_by = au.id
                 ORDER BY pp.created_at DESC`
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching preference periods: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM preference_periods WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding preference period: ${error.message}`);
        }
    }

    static async getCurrentPeriod() {
        try {
            const now = new Date();
            const [rows] = await pool.execute(
                'SELECT * FROM preference_periods WHERE start_date <= ? AND end_date >= ? AND status = "active" LIMIT 1',
                [now, now]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding current preference period: ${error.message}`);
        }
    }

    static async getActivePeriod() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM preference_periods WHERE status = "active" ORDER BY created_at DESC LIMIT 1'
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding active preference period: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        const { startDate, endDate, status } = updateData;

        try {
            const [result] = await pool.execute(
                `UPDATE preference_periods SET start_date = ?, end_date = ?, status = ?,
                 updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [startDate, endDate, status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating preference period: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM preference_periods WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting preference period: ${error.message}`);
        }
    }

    static async updateStatus() {
        try {
            const now = new Date();

            // Update periods that should be active
            await pool.execute(
                `UPDATE preference_periods
                 SET status = 'active'
                 WHERE start_date <= ? AND end_date >= ? AND status = 'upcoming'`,
                [now, now]
            );

            // Update periods that should be completed
            await pool.execute(
                `UPDATE preference_periods
                 SET status = 'completed'
                 WHERE end_date < ? AND status = 'active'`,
                [now]
            );

            return true;
        } catch (error) {
            throw new Error(`Error updating period statuses: ${error.message}`);
        }
    }

    static async isPreferenceTimeActive() {
        try {
            const currentPeriod = await this.getCurrentPeriod();
            return currentPeriod !== null;
        } catch (error) {
            return false;
        }
    }
}

module.exports = PreferencePeriod;