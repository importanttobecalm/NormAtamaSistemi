const Teacher = require('./models/Teacher');

async function testTeacherAPI() {
    console.log('🔍 Testing Teacher API...\n');

    try {
        // Test 1: Get all teachers
        console.log('Test 1: Getting all teachers...');
        const teachers = await Teacher.getAll(5, 0, '');
        console.log(`✅ Found ${teachers.length} teachers`);
        if (teachers.length > 0) {
            console.log('First teacher:', teachers[0].first_name, teachers[0].last_name);
        }
        console.log('');

        // Test 2: Get count
        console.log('Test 2: Getting teacher count...');
        const count = await Teacher.getCount('');
        console.log(`✅ Total teachers: ${count}`);
        console.log('');

        // Test 3: Search teachers
        console.log('Test 3: Searching teachers...');
        const searchResults = await Teacher.getAll(10, 0, 'Test');
        console.log(`✅ Found ${searchResults.length} teachers matching "Test"`);
        console.log('');

        console.log('✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testTeacherAPI();
