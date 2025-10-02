const { pool } = require('./config/database');

async function fixTurkishChars() {
    try {
        console.log('🔧 Fixing Turkish characters in database...');

        // Update teacher names
        await pool.execute(`
            UPDATE teachers
            SET first_name = ?, last_name = ?, current_assignment = ?
            WHERE tc_id = ?
        `, ['Mehmet', 'Yılmaz', 'Ankara Atatürk İlkokulu', '12345678901']);

        await pool.execute(`
            UPDATE teachers
            SET first_name = ?, last_name = ?, current_assignment = ?
            WHERE tc_id = ?
        `, ['Ayşe', 'Demir', 'İstanbul Fatih Ortaokulu', '12345678902']);

        await pool.execute(`
            UPDATE teachers
            SET first_name = ?, last_name = ?, current_assignment = ?
            WHERE tc_id = ?
        `, ['Ali', 'Kaya', 'İzmir Konak Lisesi', '12345678903']);

        // Update position names
        await pool.execute(`UPDATE positions SET school_name = ? WHERE id = ?`,
            ['Ankara Çankaya İlkokulu', 1]);

        await pool.execute(`UPDATE positions SET school_name = ? WHERE id = ?`,
            ['İstanbul Beşiktaş Ortaokulu', 2]);

        await pool.execute(`UPDATE positions SET school_name = ? WHERE id = ?`,
            ['İzmir Bornova Lisesi', 3]);

        await pool.execute(`UPDATE positions SET school_name = ? WHERE id = ?`,
            ['Bursa Osmangazi İlkokulu', 4]);

        await pool.execute(`UPDATE positions SET school_name = ? WHERE id = ?`,
            ['Antalya Muratpaşa Ortaokulu', 5]);

        console.log('✅ Turkish characters fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing Turkish characters:', error);
        process.exit(1);
    }
}

fixTurkishChars();