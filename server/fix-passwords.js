const bcrypt = require('bcryptjs');

async function generateHashes() {
    // Admin şifresi: admin123
    const adminHash = await bcrypt.hash('admin123', 10);
    console.log('Admin password hash for "admin123":');
    console.log(adminHash);

    // Öğretmen şifreleri (doğum tarihi formatı)
    const teacherPasswords = [
        '15.05.1985', // 12345678901
        '22.03.1982', // 12345678902
        '08.11.1988'  // 12345678903
    ];

    console.log('\nTeacher password hashes:');
    for (let i = 0; i < teacherPasswords.length; i++) {
        const hash = await bcrypt.hash(teacherPasswords[i], 10);
        console.log(`${teacherPasswords[i]} -> ${hash}`);
    }
}

generateHashes().catch(console.error);