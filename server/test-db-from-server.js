const mysql = require('mysql2/promise');

async function testDB() {
    try {
        console.log('Testing database connection...');

        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Sifre123',
            database: 'norm_atama_db'
        });

        console.log('\n✅ Database connected!');

        // Test 1: Get all teachers
        console.log('\n--- Test 1: Get all teachers ---');
        const [teachers] = await connection.execute(
            'SELECT tc_id, first_name, last_name, branch FROM teachers LIMIT 5'
        );
        console.log('Teachers found:', teachers.length);
        teachers.forEach(t => console.log(`  - ${t.first_name} ${t.last_name} (${t.branch})`));

        // Test 2: Count teachers
        console.log('\n--- Test 2: Count teachers ---');
        const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
        console.log('Total teachers:', countResult[0].count);

        // Test 3: Search teachers
        console.log('\n--- Test 3: Search with LIKE ---');
        const searchParam = '%Test%';
        const [searchResults] = await connection.execute(
            'SELECT tc_id, first_name, last_name FROM teachers WHERE first_name LIKE ? OR last_name LIKE ?',
            [searchParam, searchParam]
        );
        console.log('Search results:', searchResults.length);

        await connection.end();
        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Error code:', error.code);
        console.error('Stack:', error.stack);
    }
}

testDB();
