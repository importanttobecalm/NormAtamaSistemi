const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Migration endpoint - one-time use to create refresh_tokens table
router.get('/create-refresh-tokens-table', async (req, res) => {
    try {
        // Check if table already exists
        const [existingTables] = await pool.execute(
            "SHOW TABLES LIKE 'refresh_tokens'"
        );

        if (existingTables.length > 0) {
            return res.json({
                success: true,
                message: 'Table already exists',
                alreadyExists: true
            });
        }

        // Create the table
        await pool.execute(`
            CREATE TABLE refresh_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                user_type ENUM('admin', 'teacher') NOT NULL,
                token VARCHAR(512) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_token (token(255)),
                INDEX idx_user_id (user_id)
            )
        `);

        // Verify table creation
        const [columns] = await pool.execute('DESCRIBE refresh_tokens');

        res.json({
            success: true,
            message: 'refresh_tokens table created successfully!',
            tableStructure: columns
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating table',
            error: error.message
        });
    }
});

module.exports = router;
