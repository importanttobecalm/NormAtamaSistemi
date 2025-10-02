const { pool, testConnection } = require('./server/config/database');

async function test() {
  console.log('Railway MySQL bağlantısı test ediliyor...\n');

  const success = await testConnection();

  if (success) {
    console.log('\nTabloları listeleniyor...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('\nMevcut tablolar:');
    tables.forEach(row => console.log('  -', Object.values(row)[0]));

    console.log('\nAdmin kullanıcıları kontrol ediliyor...');
    const [admins] = await pool.query('SELECT username, role FROM admin_users');
    console.log('Admin kullanıcılar:', admins);

    console.log('\nÖğretmen sayısı:');
    const [teacherCount] = await pool.query('SELECT COUNT(*) as count FROM teachers');
    console.log('Toplam öğretmen:', teacherCount[0].count);

    console.log('\nPozisyon sayısı:');
    const [positionCount] = await pool.query('SELECT COUNT(*) as count FROM positions');
    console.log('Toplam pozisyon:', positionCount[0].count);
  }

  await pool.end();
  console.log('\n✓ Test tamamlandı!');
}

test().catch(console.error);
