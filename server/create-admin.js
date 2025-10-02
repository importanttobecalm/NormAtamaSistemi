const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function createAdmin() {
    try {
        // Check if admin already exists
        const [existingAdmin] = await pool.query(
            'SELECT * FROM admin_users WHERE username = ?',
            ['admin']
        );

        if (existingAdmin.length > 0) {
            console.log('✅ Admin kullanıcısı zaten mevcut');
            console.log('Username: admin');
            console.log('Password: Admin123');
            process.exit(0);
        }

        // Hash the password
        const password = 'Admin123';
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert admin user
        await pool.query(
            'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
            ['admin', passwordHash, 'super_admin']
        );

        console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
        console.log('Username: admin');
        console.log('Password: Admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

createAdmin();