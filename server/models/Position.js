const { pool } = require('../config/database');

class Position {
    static async create(positionData) {
        const { schoolName, district, branch, quota } = positionData;

        try {
            const [result] = await pool.execute(
                `INSERT INTO positions (school_name, district, branch, quota)
                 VALUES (?, ?, ?, ?)`,
                [schoolName, district, branch, quota]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating position: ${error.message}`);
        }
    }

    static async getAll(limit = 100, offset = 0, search = '', branch = '') {
        try {
            // Validate and sanitize limit and offset
            const safeLimit = Math.max(1, Math.min(parseInt(limit) || 100, 100));
            const safeOffset = Math.max(0, parseInt(offset) || 0);

            let query = 'SELECT * FROM positions WHERE status = "active"';
            let params = [];

            if (search) {
                query += ' AND (school_name LIKE ? OR district LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam);
            }

            if (branch) {
                query += ' AND branch = ?';
                params.push(branch);
            }

            query += ` ORDER BY district ASC, school_name ASC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error fetching positions: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM positions WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding position: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        const { schoolName, district, branch, quota, status } = updateData;

        try {
            const [result] = await pool.execute(
                `UPDATE positions SET school_name = ?, district = ?, branch = ?,
                 quota = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [schoolName, district, branch, quota, status || 'active', id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating position: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM positions WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting position: ${error.message}`);
        }
    }

    static async getByBranch(branch) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM positions WHERE branch = ? AND status = "active" ORDER BY district ASC, school_name ASC',
                [branch]
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching positions by branch: ${error.message}`);
        }
    }

    static async getCount(search = '', branch = '') {
        try {
            let query = 'SELECT COUNT(*) as count FROM positions WHERE status = "active"';
            let params = [];

            if (search) {
                query += ' AND (school_name LIKE ? OR district LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam);
            }

            if (branch) {
                query += ' AND branch = ?';
                params.push(branch);
            }

            const [rows] = await pool.execute(query, params);
            return rows[0].count;
        } catch (error) {
            throw new Error(`Error getting position count: ${error.message}`);
        }
    }

    static async getBranches() {
        try {
            const [rows] = await pool.execute(
                'SELECT DISTINCT branch FROM positions WHERE status = "active" ORDER BY branch ASC'
            );
            return rows.map(row => row.branch);
        } catch (error) {
            throw new Error(`Error fetching branches: ${error.message}`);
        }
    }
}

module.exports = Position;