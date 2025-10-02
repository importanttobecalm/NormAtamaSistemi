const { pool } = require('../config/database');

class Teacher {
    static async findByTcId(tcId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM teachers WHERE tc_id = ?',
                [tcId]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding teacher: ${error.message}`);
        }
    }

    static async create(teacherData) {
        const { tcId, firstName, lastName, birthDate, placementPoints, branch, currentAssignment, passwordHash } = teacherData;

        try {
            const [result] = await pool.execute(
                `INSERT INTO teachers (tc_id, first_name, last_name, birth_date, placement_points, branch, current_assignment, password_hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [tcId, firstName, lastName, birthDate, placementPoints, branch, currentAssignment, passwordHash]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Bu TC kimlik numarası ile kayıtlı öğretmen zaten mevcut');
            }
            throw new Error(`Error creating teacher: ${error.message}`);
        }
    }

    static async getAll(limit = 100, offset = 0, search = '') {
        try {
            // Validate and sanitize limit and offset
            const safeLimit = Math.max(1, Math.min(parseInt(limit) || 100, 100));
            const safeOffset = Math.max(0, parseInt(offset) || 0);

            let query = 'SELECT tc_id, first_name, last_name, birth_date, placement_points, branch, current_assignment, created_at FROM teachers';
            let params = [];

            if (search) {
                query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR tc_id LIKE ? OR branch LIKE ?';
                const searchParam = `%${search}%`;
                params = [searchParam, searchParam, searchParam, searchParam];
            }

            query += ` ORDER BY placement_points DESC, last_name ASC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error fetching teachers: ${error.message}`);
        }
    }

    static async update(tcId, updateData) {
        const { firstName, lastName, birthDate, placementPoints, branch, currentAssignment } = updateData;

        try {
            const [result] = await pool.execute(
                `UPDATE teachers SET first_name = ?, last_name = ?, birth_date = ?,
                 placement_points = ?, branch = ?, current_assignment = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE tc_id = ?`,
                [firstName, lastName, birthDate, placementPoints, branch, currentAssignment, tcId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating teacher: ${error.message}`);
        }
    }

    static async delete(tcId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM teachers WHERE tc_id = ?',
                [tcId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting teacher: ${error.message}`);
        }
    }

    static async updateLastLogin(tcId) {
        try {
            await pool.execute(
                'UPDATE teachers SET last_login = CURRENT_TIMESTAMP WHERE tc_id = ?',
                [tcId]
            );
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    static async getCount(search = '') {
        try {
            let query = 'SELECT COUNT(*) as count FROM teachers';
            let params = [];

            if (search) {
                query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR tc_id LIKE ? OR branch LIKE ?';
                const searchParam = `%${search}%`;
                params = [searchParam, searchParam, searchParam, searchParam];
            }

            const [rows] = await pool.execute(query, params);
            return rows[0].count;
        } catch (error) {
            throw new Error(`Error getting teacher count: ${error.message}`);
        }
    }
}

module.exports = Teacher;