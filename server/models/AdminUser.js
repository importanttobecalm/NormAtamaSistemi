const { pool } = require('../config/database');

class AdminUser {
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM admin_users WHERE username = ?',
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding admin user: ${error.message}`);
        }
    }

    static async create(userData) {
        const { username, passwordHash, role } = userData;

        try {
            const [result] = await pool.execute(
                `INSERT INTO admin_users (username, password_hash, role)
                 VALUES (?, ?, ?)`,
                [username, passwordHash, role || 'admin']
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Bu kullanıcı adı zaten mevcut');
            }
            throw new Error(`Error creating admin user: ${error.message}`);
        }
    }

    static async updateLastLogin(id) {
        try {
            await pool.execute(
                'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error updating admin last login:', error);
        }
    }

    static async getAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id, username, role, created_at, last_login FROM admin_users ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching admin users: ${error.message}`);
        }
    }

    static async updatePassword(id, newPasswordHash) {
        try {
            const [result] = await pool.execute(
                'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newPasswordHash, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating admin password: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM admin_users WHERE id = ? AND id != 1', // Protect first admin
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting admin user: ${error.message}`);
        }
    }
}

module.exports = AdminUser;