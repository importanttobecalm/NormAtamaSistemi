# NORM ATAMA SİSTEMİ - HATA ÇÖZÜM KILAVUZU

**Versiyon:** 1.1.1
**Son Güncelleme:** 4 Ekim 2025

Bu dokümanda, geliştirme sürecinde karşılaşılan tüm hatalar, nedenleri ve çözümleri detaylı olarak açıklanmıştır.

---

## İçindekiler

1. [Backend Hataları](#1-backend-hataları)
2. [Frontend Hataları](#2-frontend-hataları)
3. [Database Hataları](#3-database-hataları)
4. [Deployment Hataları](#4-deployment-hataları)
5. [Security Hataları](#5-security-hataları)
6. [Production Hataları](#6-production-hataları)

---

## 1. Backend Hataları

### 1.1 Rate Limiting 429 Error

**Hata:**
```
Failed to load resource: the server responded with a status of 429 ()
Message: "Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyiniz."
```

**Neden:**
- Login endpoint'inde IP başına 20 deneme limiti var
- Test sırasında çok fazla login denemesi yapıldı
- Rate limiter devreye girdi

**Çözüm 1 - Development'ta Limiti Arttır:**
```javascript
// server/index.js
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 20 : 100,  // Dev'de 100
    skipSuccessfulRequests: true
});
```

**Çözüm 2 - IP Değiştir (Geçici):**
```bash
# VPN kullan veya farklı network'e bağlan
# Veya tarayıcı incognito mode'u dene
```

**Çözüm 3 - Rate Limit Reset (Development):**
```javascript
// Server restart yap
# Terminal'de:
npm run dev
```

**Kalıcı Çözüm (Production):**
- Rate limit gerekli, değiştirme
- Başarılı loginler zaten sayılmıyor (`skipSuccessfulRequests: true`)
- 15 dakika bekle veya IP değiştir

---

### 1.2 Branş Case Sensitivity Hatası

**Hata:**
```
Status: 400
Message: "Sadece kendi branşınıza ait pozisyonları seçebilirsiniz"
```

**Neden:**
- Database'de bazı branşlar küçük harf: "matematik"
- Bazı branşlar büyük harf: "Matematik"
- `position.branch !== teacher.branch` kontrolü case-sensitive

**Örnek Veri:**
```sql
-- Teacher
tc_id: '15275885552', branch: 'matematik'

-- Position
id: 1, branch: 'Matematik'

-- Kontrol:
'matematik' !== 'Matematik'  // true (hata!)
```

**Çözüm:**
```javascript
// server/routes/teacher/preferences.js
// ÖNCE (Hatalı):
if (position.branch !== teacher.branch) {
    return res.status(400).json({
        message: 'Sadece kendi branşınıza ait pozisyonları seçebilirsiniz'
    });
}

// SONRA (Düzeltilmiş):
if (position.branch.toLowerCase() !== teacher.branch.toLowerCase()) {
    return res.status(400).json({
        message: 'Sadece kendi branşınıza ait pozisyonları seçebilirsiniz'
    });
}
```

**Commit:**
```bash
git commit -m "fix(preferences): Case-insensitive branch comparison"
```

---

### 1.3 Preference Save Transaction Hatası

**Hata:**
```
Error saving preferences: Cannot read property 'positionId' of undefined
```

**Neden:**
- Frontend'den gelen `preferences` array'i boş veya hatalı format

**Debug:**
```javascript
// server/routes/teacher/preferences.js
console.log('Saving preferences for teacher:', req.user.tcId);
console.log('Preferences to save:', preferences);
```

**Çözüm:**
```javascript
// Boş tercih durumunu handle et
if (!preferences || preferences.length === 0) {
    await Preference.savePreferences(req.user.tcId, activePeriod.id, []);
    return res.json({ message: 'Tercihler başarıyla kaydedildi' });
}
```

---

### 1.4 JWT Token Expired Hatası

**Hata:**
```
Status: 401
Message: "Geçersiz veya süresi dolmuş token"
```

**Neden:**
- Access token süresi 15 dakika
- Token expire oldu ama refresh çalışmadı

**Çözüm 1 - Frontend Refresh Logic:**
```javascript
// client/src/contexts/AuthContext.js
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // Token expired, try refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post('/api/auth/refresh', { refreshToken });
                    const { accessToken } = response.data;

                    localStorage.setItem('token', accessToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    // Retry original request
                    return axios(error.config);
                } catch (refreshError) {
                    // Refresh failed, logout
                    logout();
                }
            }
        }
        return Promise.reject(error);
    }
);
```

**Çözüm 2 - Backend Refresh Token Storage:**
```javascript
// Refresh token database'e kaydedilmeli
const generateRefreshToken = async (userId, userType) => {
    const refreshToken = jwt.sign(
        { id: userId, userType },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    await pool.execute(
        `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [userId, userType, refreshToken]
    );

    return refreshToken;
};
```

---

### 1.5 Cookie Not Set Hatası

**Hata:**
- Token cookie olarak gönderilmiyor
- Frontend token'ı alamıyor

**Neden:**
- `sameSite: 'strict'` CORS ile çakışıyor
- Development'ta HTTP, production'da HTTPS

**Çözüm:**
```javascript
// server/index.js
res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Sadece HTTPS'de secure
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000
});
```

---

## 2. Frontend Hataları

### 2.1 CORS Policy Error

**Hata:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**Neden:**
- Backend CORS ayarları localhost:3000'i izin vermiyor

**Çözüm:**
```javascript
// server/index.js
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://normatamasistemi-production.up.railway.app']
        : ['http://localhost:3000'],
    credentials: true  // Cookie için gerekli
};
app.use(cors(corsOptions));
```

**Alternatif - Client Proxy:**
```json
// client/package.json
{
    "proxy": "http://localhost:5000"
}
```

---

### 2.2 Doğum Tarihi Format Hatası

**Hata:**
```
Invalid date format. Expected: DD.MM.YYYY
```

**Neden:**
- Kullanıcı YYYY-MM-DD formatında giriyor
- Backend GG.AA.YYYY bekliyor

**Çözüm - Auto Format Input:**
```javascript
// Login.js
const handleBirthDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Sadece rakam

    if (value.length >= 2) {
        value = value.slice(0, 2) + '.' + value.slice(2);
    }
    if (value.length >= 5) {
        value = value.slice(0, 5) + '.' + value.slice(5, 9);
    }

    setBirthDate(value);  // GG.AA.YYYY
};
```

---

### 2.3 Protected Route Infinite Loop

**Hata:**
- Sayfa sürekli yenileniyor
- Login → Dashboard → Login loop

**Neden:**
- `useAuth()` loading state hiç false olmuyor
- Token verify başarısız ama hata handle edilmiyor

**Çözüm:**
```javascript
// AuthContext.js
useEffect(() => {
    const verifyToken = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);  // Token yoksa loading'i bitir
            return;
        }

        try {
            const response = await axios.get('/api/auth/verify');
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem('token');  // Hatalı token'ı temizle
        } finally {
            setLoading(false);  // Her durumda loading'i bitir
        }
    };

    verifyToken();
}, []);
```

---

### 2.4 State Update After Unmount

**Hata:**
```
Warning: Can't perform a React state update on an unmounted component
```

**Neden:**
- Async işlem devam ederken component unmount oluyor

**Çözüm:**
```javascript
useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/...');
            if (isMounted) {
                setData(response.data);
            }
        } catch (error) {
            if (isMounted) {
                setError(error.message);
            }
        }
    };

    fetchData();

    return () => {
        isMounted = false;
    };
}, []);
```

---

### 2.5 Tercih Sıralaması Bug

**Hata:**
- Tercih yukarı/aşağı hareket ettirince kaybolup çoğalıyor
- Index karışıyor

**Neden:**
- React key prop'u yanlış (index kullanılmış)
- Swap algoritması hatalı

**Çözüm:**
```javascript
// TeacherPreferences.js
// Key olarak unique ID kullan
{myPreferences.map((pref, index) => (
    <div key={pref.id || pref.position_id}>  {/* Index değil! */}
        {/* ... */}
    </div>
))}

// Swap algoritması
const movePreference = (index, direction) => {
    const newPreferences = [...myPreferences];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newPreferences.length) return;

    // Doğru swap
    [newPreferences[index], newPreferences[newIndex]] =
    [newPreferences[newIndex], newPreferences[index]];

    setMyPreferences(newPreferences);
};
```

---

## 3. Database Hataları

### 3.1 Connection Pool Exhausted

**Hata:**
```
Error: Too many connections
ER_CON_COUNT_ERROR: Connection count exceeded
```

**Neden:**
- Connection leak (release edilmiyor)
- Connection limit düşük (default: 10)

**Çözüm 1 - Connection Release:**
```javascript
// Model'de connection kullanımı
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();
    // İşlemler...
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();  // MUTLAKA!
}
```

**Çözüm 2 - Pool Limit Arttır:**
```javascript
// server/config/database.js
const pool = mysql.createPool({
    connectionLimit: 20,  // 10'dan 20'ye çıkar
    queueLimit: 0,
    waitForConnections: true
});
```

---

### 3.2 Unique Constraint Violation

**Hata:**
```
ER_DUP_ENTRY: Duplicate entry '12345678901-5-1' for key
'unique_teacher_position_period'
```

**Neden:**
- Aynı pozisyon iki kez seçilmeye çalışıldı
- Frontend validation eksik

**Çözüm - Frontend Kontrolü:**
```javascript
const addPreference = (position) => {
    // Zaten seçilmiş mi kontrol et
    const alreadySelected = myPreferences.some(
        p => (p.id || p.position_id) === position.id
    );

    if (alreadySelected) {
        alert('Bu pozisyon zaten tercih listenizde');
        return;
    }

    setMyPreferences([...myPreferences, position]);
};
```

---

### 3.3 Foreign Key Constraint Fail

**Hata:**
```
ER_ROW_IS_REFERENCED: Cannot delete or update a parent row:
a foreign key constraint fails
```

**Neden:**
- Teacher silinmeye çalışılıyor ama preferences var
- CASCADE ayarlanmamış

**Çözüm:**
```sql
-- Schema'da CASCADE eklenmeli
ALTER TABLE preferences
DROP FOREIGN KEY preferences_ibfk_1;

ALTER TABLE preferences
ADD CONSTRAINT preferences_ibfk_1
FOREIGN KEY (teacher_tc_id) REFERENCES teachers(tc_id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

---

### 3.4 Date Format Mismatch

**Hata:**
```
ER_TRUNCATED_WRONG_VALUE: Incorrect datetime value: '15.05.1985'
```

**Neden:**
- MySQL DATE type YYYY-MM-DD bekliyor
- GG.AA.YYYY formatında gönderiliyor

**Çözüm:**
```javascript
// Backend'de format dönüşümü
const formatDateForDB = (dateStr) => {
    // GG.AA.YYYY → YYYY-MM-DD
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
};

// Teacher create
const birthDate = formatDateForDB(req.body.birthDate);
await pool.execute(
    'INSERT INTO teachers (..., birth_date, ...) VALUES (..., ?, ...)',
    [..., birthDate, ...]
);
```

---

## 4. Deployment Hataları

### 4.1 Railway Build Failed

**Hata:**
```
npm ERR! Missing script: "build"
Build failed with exit code 1
```

**Neden:**
- Railway `npm run build` çalıştırıyor
- Root package.json'da build script yok

**Çözüm:**
```json
// package.json (root)
{
    "scripts": {
        "build": "cd client && npm install && npm run build",
        "start": "cd server && node index.js"
    }
}
```

---

### 4.2 Environment Variables Not Found

**Hata:**
```
Error: JWT_SECRET is not defined
```

**Neden:**
- Railway dashboard'da environment variables ayarlanmamış

**Çözüm:**
```bash
# Railway Dashboard → Variables
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<another-secret>
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}
NODE_ENV=production
PORT=5000
```

---

### 4.3 Database Connection Timeout

**Hata:**
```
Error: connect ETIMEDOUT
```

**Neden:**
- Railway MySQL internal URL kullanılmamış
- Public URL timeout veriyor

**Çözüm:**
```javascript
// Railway'de otomatik variable reference kullan
DB_HOST=${{MySQL.MYSQLHOST}}  // Internal URL
DB_PORT=${{MySQL.MYSQLPORT}}
```

---

### 4.4 Static Files Not Served (404)

**Hata:**
- React routes 404 veriyor
- `/admin/dashboard` → 404

**Neden:**
- Production'da React build serve edilmiyor
- API routes ile React routes çakışıyor

**Çözüm:**
```javascript
// server/index.js
if (process.env.NODE_ENV === 'production') {
    // Static files
    app.use(express.static(path.join(__dirname, '../client/build')));

    // API routes önce
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/teacher', teacherRoutes);

    // React SPA catch-all (EN SON!)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
```

---

## 5. Security Hataları

### 5.1 XSS Vulnerability

**Hata:**
- User input direkt HTML'e yazılıyor
- `<script>alert('XSS')</script>` çalışıyor

**Neden:**
- Input sanitization yok
- dangerouslySetInnerHTML kullanılmış

**Çözüm:**
```javascript
// Backend - Middleware
const detectSuspiciousActivity = (req, res, next) => {
    const xssPatterns = [
        /<script[^>]*>.*?<\/script>/i,
        /javascript:/i,
        /on\w+\s*=/i
    ];

    const checkStr = JSON.stringify(req.body);

    for (const pattern of xssPatterns) {
        if (pattern.test(checkStr)) {
            return res.status(400).json({
                message: 'Geçersiz istek tespit edildi'
            });
        }
    }
    next();
};

// Frontend - Never use dangerouslySetInnerHTML
// Use text content, not HTML
```

---

### 5.2 SQL Injection Risk

**Hata:**
```javascript
// TEHLIKE!
const query = `SELECT * FROM users WHERE username = '${username}'`;
await pool.execute(query);
```

**Saldırı:**
```
username: admin' OR '1'='1
Query: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
Result: Tüm kullanıcılar döner!
```

**Çözüm:**
```javascript
// Parameterized queries KULLAN
const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]  // Otomatik escape
);
```

---

### 5.3 Session Fixation

**Hata:**
- Login sonrası aynı token kullanılıyor
- Session fixation saldırısına açık

**Çözüm:**
```javascript
// Login'de YENİ token oluştur
router.post('/login', async (req, res) => {
    // Old token'ı blacklist'e ekle (varsa)
    const oldToken = req.cookies.accessToken;
    if (oldToken) {
        blacklistToken(oldToken);
    }

    // Yeni token oluştur
    const newAccessToken = generateAccessToken({ ... });

    res.cookie('accessToken', newAccessToken, { ... });
});
```

---

## 6. Production Hataları

### 6.1 HTTPS Redirect Loop

**Hata:**
- Sayfa sürekli yönleniyor
- "Too many redirects" hatası

**Neden:**
```javascript
// Railway zaten HTTPS, tekrar redirect gereksiz
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});
```

**Çözüm:**
```javascript
// Railway otomatik HTTPS sağlıyor, gereksiz
// Sadece HSTS header ekle
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true
}));
```

---

### 6.2 Cookie Not Working in Production

**Hata:**
- Cookie set edilmiyor
- Token cookie'den okunamıyor

**Neden:**
- `sameSite: 'strict'` + farklı subdomain
- `secure: true` ama HTTP

**Çözüm:**
```javascript
res.cookie('accessToken', token, {
    httpOnly: true,
    secure: true,  // Railway HTTPS otomatik
    sameSite: 'lax',  // strict yerine lax (production'da)
    domain: '.railway.app'  // Tüm subdomainler için
});
```

---

### 6.3 Setup Endpoint Exposed

**Hata:**
- Production'da `/api/setup-db/initialize` erişilebilir
- Güvenlik riski!

**Çözüm:**
```javascript
// server/index.js
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/setup-db', setupDbRoutes);
}
// Production'da route hiç mount edilmez
```

---

### 6.4 Memory Leak - Token Blacklist

**Hata:**
- Uzun süre çalışınca RAM tükeniyor
- Blacklist sürekli büyüyor

**Neden:**
```javascript
// Set hiç temizlenmiyor
const tokenBlacklist = new Set();
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // SORUN: Hiç silinmiyor!
};
```

**Çözüm:**
```javascript
const blacklistToken = (token) => {
    tokenBlacklist.add(token);

    // 15 dakika sonra otomatik temizle
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 15 * 60 * 1000);
};

// Daha İyi: Redis kullan
const redis = require('redis');
const client = redis.createClient();

const blacklistToken = async (token) => {
    await client.setex(
        `blacklist:${token}`,
        900,  // 15 dakika TTL
        '1'
    );
};
```

---

## 7. Genel Best Practices

### 7.1 Error Handling Pattern

```javascript
// Route Handler Pattern
router.get('/example', async (req, res) => {
    try {
        const data = await Model.getData();
        res.json(data);
    } catch (error) {
        console.error('Error in /example:', error);
        res.status(500).json({
            message: process.env.NODE_ENV === 'production'
                ? 'Bir hata oluştu'
                : error.message
        });
    }
});
```

### 7.2 Async/Await vs Promises

```javascript
// ❌ Promise Hell
getData()
    .then(data => processData(data))
    .then(result => saveData(result))
    .catch(error => handleError(error));

// ✅ Async/Await
try {
    const data = await getData();
    const result = await processData(data);
    await saveData(result);
} catch (error) {
    handleError(error);
}
```

### 7.3 Database Transaction Pattern

```javascript
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();

    // İşlem 1
    await connection.execute('...');

    // İşlem 2
    await connection.execute('...');

    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();  // Mutlaka!
}
```

---

## Hızlı Hata Arama

### Backend 401 Unauthorized
1. Token var mı? → `localStorage.getItem('token')`
2. Token blacklist'te mi? → `isTokenBlacklisted()`
3. Token expired mi? → JWT verify
4. User database'de var mı? → Model.findById()

### Backend 400 Bad Request
1. Input validation hatası mı? → `validationResult(req)`
2. Suspicious activity mi? → Console'da "Suspicious activity detected"
3. Business logic hatası mı? → Route handler'daki custom validation

### Backend 500 Internal Server Error
1. Database connection var mı? → `pool.execute()` try-catch
2. Model method hatası mı? → Console'da stack trace
3. Undefined variable mı? → TypeScript kullan (gelecekte)

### Frontend Network Error
1. CORS hatası mı? → Browser console'da CORS message
2. URL doğru mu? → `/api/...` prefix var mı?
3. Proxy çalışıyor mu? → `package.json` proxy ayarı

### Frontend State Hatası
1. Infinite loop mu? → useEffect dependencies
2. Stale closure mu? → useState callback form kullan
3. Async update mi? → isMounted pattern

---

## Yararlı Debug Komutları

```bash
# Backend logs
npm run server
# Console'da tüm error'lar görünür

# Database query debug
# mysql2 pool.execute console.log ekle
console.log('Query:', query);
console.log('Params:', params);

# Frontend network debug
# Chrome DevTools → Network → Preserve log

# Cookie debug
# Application → Cookies → localhost/railway.app

# Token debug
# JWT.io'ya token'ı yapıştır

# Railway logs
railway logs --tail
```

---

**Son Güncelleme:** 4 Ekim 2025
**Toplam Hata Çözümü:** 30+
