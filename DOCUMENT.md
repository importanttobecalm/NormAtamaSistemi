# NORM ATAMA SİSTEMİ - KAPSAMLI TEKNİK DOKÜMANTASYON

**Versiyon:** 1.1.1
**Son Güncelleme:** 4 Ekim 2025
**Yazar:** Development Team

---

## İçindekiler

1. [Projeye Genel Bakış](#1-projeye-genel-bakış)
2. [Mimari Yapı](#2-mimari-yapı)
3. [Backend Detaylı Analiz](#3-backend-detaylı-analiz)
4. [Frontend Detaylı Analiz](#4-frontend-detaylı-analiz)
5. [Veritabanı Şeması](#5-veritabanı-şeması)
6. [Kimlik Doğrulama Sistemi](#6-kimlik-doğrulama-sistemi)
7. [Güvenlik Mekanizmaları](#7-güvenlik-mekanizmaları)
8. [İş Akışları](#8-iş-akışları)
9. [API Referansı](#9-api-referansı)
10. [Önemli Özellikler](#10-önemli-özellikler)

---

## 1. Projeye Genel Bakış

### 1.1 Proje Amacı

Norm Atama Sistemi, norm fazlası öğretmenlerin yeni görev yerlerine atanması sürecini dijitalleştiren bir web uygulamasıdır. Manuel olarak yürütülen, zaman alıcı ve hata yapılmaya açık olan atama sürecini otomatikleştirir.

### 1.2 Temel İşlevler

**Yönetici (Admin) Tarafı:**
- Öğretmen kayıtlarını yönetme (CRUD)
- Açık pozisyonları yönetme
- Tercih dönemlerini belirleme ve yönetme
- İstatistikleri görüntüleme
- Raporlama

**Öğretmen Tarafı:**
- Kişisel bilgileri görüntüleme
- Tercih döneminde 1-25 arası sıralı tercih yapma
- Tercihlerini güncelleme
- Atama sonuçlarını görüntüleme

### 1.3 Teknoloji Yığını

**Backend:**
- Node.js (Runtime)
- Express.js (Web Framework)
- MySQL (Database)
- JWT (Authentication)
- bcrypt (Password Hashing)

**Frontend:**
- React 18 (UI Framework)
- React Router DOM v6 (Routing)
- Axios (HTTP Client)
- Context API (State Management)

**DevOps:**
- Railway (Cloud Platform)
- Docker (Containerization)
- GitHub (Version Control)

---

## 2. Mimari Yapı

### 2.1 Genel Mimari

```
┌─────────────────────────────────────────┐
│         CLIENT (React SPA)              │
│  ┌──────────┐  ┌──────────┐            │
│  │  Admin   │  │ Teacher  │            │
│  │  Pages   │  │  Pages   │            │
│  └──────────┘  └──────────┘            │
│         │              │                │
│         └──────┬───────┘                │
│                │                         │
│         ┌──────▼───────┐                │
│         │ AuthContext  │                │
│         │   (Global)   │                │
│         └──────────────┘                │
└─────────────────┬───────────────────────┘
                  │ HTTP/HTTPS
                  │ (Axios)
┌─────────────────▼───────────────────────┐
│         SERVER (Express.js)             │
│  ┌──────────────────────────────────┐  │
│  │   Middleware Chain               │  │
│  │  • Rate Limiting                 │  │
│  │  • Security (Helmet)             │  │
│  │  • CORS                          │  │
│  │  • Authentication                │  │
│  │  • Validation                    │  │
│  └──────────────────────────────────┘  │
│                  │                       │
│  ┌───────────────▼──────────────────┐  │
│  │          Routes                   │  │
│  │  /api/auth/*                      │  │
│  │  /api/admin/*                     │  │
│  │  /api/teacher/*                   │  │
│  └───────────────┬──────────────────┘  │
│                  │                       │
│  ┌───────────────▼──────────────────┐  │
│  │          Models                   │  │
│  │  • AdminUser                      │  │
│  │  • Teacher                        │  │
│  │  • Position                       │  │
│  │  • Preference                     │  │
│  │  • PreferencePeriod               │  │
│  └───────────────┬──────────────────┘  │
└──────────────────┼───────────────────────┘
                   │ MySQL2
┌──────────────────▼───────────────────────┐
│         DATABASE (MySQL 8.0)             │
│  Tables:                                 │
│  • admin_users                           │
│  • teachers                              │
│  • positions                             │
│  • preferences                           │
│  • preference_periods                    │
│  • refresh_tokens                        │
└──────────────────────────────────────────┘
```

### 2.2 Dizin Yapısı

```
NormAtamaSistemi/
│
├── client/                      # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Paylaşılan Componentler
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/            # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/               # Sayfa Componentleri
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── TeacherManagement.js
│   │   │   │   ├── PositionManagement.js
│   │   │   │   └── PeriodManagement.js
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.js
│   │   │   │   ├── TeacherInfo.js
│   │   │   │   └── TeacherPreferences.js
│   │   │   └── Login.js
│   │   ├── styles/              # CSS Dosyaları
│   │   ├── App.js               # Ana Component
│   │   └── index.js             # Entry Point
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── config/
│   │   └── database.js          # MySQL Bağlantı Havuzu
│   ├── middleware/
│   │   ├── auth.js              # Kimlik Doğrulama
│   │   ├── securityEnhanced.js  # Token & Güvenlik
│   │   └── validation.js        # Input Validasyonu
│   ├── models/
│   │   ├── AdminUser.js
│   │   ├── Teacher.js
│   │   ├── Position.js
│   │   ├── PreferencePeriod.js
│   │   └── Preference.js
│   ├── routes/
│   │   ├── auth.js              # Auth Endpoints
│   │   ├── admin/
│   │   │   ├── teachers.js
│   │   │   ├── positions.js
│   │   │   ├── periods.js
│   │   │   ├── import.js
│   │   │   ├── assignments.js
│   │   │   └── reports.js
│   │   ├── teacher/
│   │   │   ├── profile.js
│   │   │   └── preferences.js
│   │   ├── setup-db.js          # Database Init
│   │   └── migrate.js           # Migrations
│   ├── database/
│   │   ├── schema.sql           # Ana Şema
│   │   └── assignments_table.sql
│   ├── .env.example
│   ├── index.js                 # Server Entry Point
│   └── package.json
│
├── Dockerfile
├── docker-compose.yml
├── README.md
└── package.json                 # Root Package
```

---

## 3. Backend Detaylı Analiz

### 3.1 Server Başlatma (index.js)

#### 3.1.1 Environment & Dependencies

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
```

**Neden Bu Paketler?**
- `dotenv`: Environment variables yönetimi
- `express`: Web framework
- `cors`: Cross-Origin Resource Sharing
- `helmet`: Security headers
- `rate-limit`: DDoS koruması
- `cookie-parser`: Cookie işlemleri
- `hpp`: HTTP Parameter Pollution koruması

#### 3.1.2 Security Middleware Stack

**1. Helmet (Security Headers)**
```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            // ...
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

**Ne Yapar?**
- XSS koruması için CSP (Content Security Policy)
- HTTPS zorlaması (HSTS)
- Clickjacking koruması (X-Frame-Options)
- MIME sniffing koruması (X-Content-Type-Options)

**2. Rate Limiting**
```javascript
// Genel API limiti
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 dakika
    max: 300,                   // IP başına 300 istek
    message: 'Çok fazla istek gönderdiniz.'
});

// Login endpoint limiti
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,                    // IP başına 20 login denemesi
    skipSuccessfulRequests: true // Başarılı loginler sayılmaz
});
```

**Neden İki Farklı Limiter?**
- Login endpoint brute-force saldırılara karşı daha hassas
- Başarılı loginleri saymazsak, gerçek kullanıcılar etkilenmez
- Genel API için daha yüksek limit, DDoS koruması için

**3. CORS Yapılandırması**
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://normatamasistemi-production.up.railway.app']
        : ['http://localhost:3000'],
    credentials: true
};
app.use(cors(corsOptions));
```

**Kritik Nokta:**
- `credentials: true` → Cookie gönderebilir
- Production'da sadece kendi domain'e izin
- Development'ta localhost:3000

#### 3.1.3 Route Montaj

```javascript
// Public routes
app.use('/api/auth', loginLimiter, authRoutes);

// Protected routes
app.use('/api/admin', adminRoutes);      // adminAuthMiddleware içeride
app.use('/api/teacher', teacherRoutes);  // teacherAuthMiddleware içeride

// Development-only
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/setup-db', setupDbRoutes);
}

// Static files (React build)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
```

**Route Koruma Stratejisi:**
- Auth routes: Rate limited, public
- Admin/Teacher routes: Middleware korumalı
- Setup route: Sadece development
- Static files: Production'da React SPA serve

---

### 3.2 Authentication Routes (routes/auth.js)

#### 3.2.1 Admin Login

```javascript
router.post('/admin/login', validateAdminLogin, async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Kullanıcıyı bul
        const admin = await AdminUser.findByUsername(username);
        if (!admin) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // 2. Şifre kontrolü
        const isValid = await bcrypt.compare(password, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // 3. Token oluştur
        const accessToken = generateAccessToken({
            id: admin.id,
            username: admin.username,
            userType: 'admin'
        });
        const refreshToken = await generateRefreshToken(admin.id, 'admin');

        // 4. Cookie set et
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000  // 15 dakika
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 gün
        });

        // 5. Response
        res.json({
            message: 'Giriş başarılı',
            user: { id: admin.id, username: admin.username, userType: 'admin' },
            accessToken,  // Backward compatibility
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Giriş sırasında hata oluştu' });
    }
});
```

**Adım Adım Ne Oluyor?**

1. **Validation**: `validateAdminLogin` middleware input'u kontrol eder
2. **User Lookup**: Database'den kullanıcı aranır
3. **Password Check**: bcrypt ile hash karşılaştırması
4. **Token Generation**:
   - Access token: 15 dakika, API istekleri için
   - Refresh token: 7 gün, token yenilemek için
5. **Cookie Setting**:
   - `httpOnly`: JavaScript erişemez (XSS koruması)
   - `secure`: Sadece HTTPS (production)
   - `sameSite: strict`: CSRF koruması
6. **Response**: Token'lar hem cookie hem de body'de döner

#### 3.2.2 Teacher Login

```javascript
router.post('/teacher/login', validateTeacherLogin, async (req, res) => {
    try {
        const { tcId, birthDate } = req.body;

        const teacher = await Teacher.findByTcId(tcId);
        if (!teacher) {
            return res.status(401).json({ message: 'Geçersiz TC kimlik veya doğum tarihi' });
        }

        // Doğum tarihi şifre olarak kullanılıyor
        const isValid = await bcrypt.compare(birthDate, teacher.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Geçersiz TC kimlik veya doğum tarihi' });
        }

        // Token oluşturma ve cookie setting aynı...
    } catch (error) {
        res.status(500).json({ message: 'Giriş sırasında hata oluştu' });
    }
});
```

**Öğretmen Login Farkı:**
- TC kimlik + doğum tarihi kullanılır
- Doğum tarihi GG.AA.YYYY formatında şifre olarak hash'lenir
- TC kimlik primary key olduğu için unique

#### 3.2.3 Token Refresh

```javascript
router.post('/refresh', async (req, res) => {
    try {
        // 1. Refresh token'ı al (cookie veya body)
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token bulunamadı' });
        }

        // 2. Token'ı verify et ve yeni access token al
        const result = await refreshAccessToken(refreshToken);

        // 3. Yeni access token'ı cookie'ye set et
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.json({
            accessToken: result.accessToken,
            user: result.user
        });
    } catch (error) {
        res.status(401).json({ message: 'Token yenileme başarısız' });
    }
});
```

**Refresh Flow:**
1. Refresh token cookie veya body'den alınır
2. `refreshAccessToken()` fonksiyonu:
   - JWT verify yapar
   - Database'de refresh token var mı kontrol eder
   - Expire olmamış mı kontrol eder
3. Yeni access token oluşturulur
4. Cookie güncellenir

#### 3.2.4 Logout

```javascript
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (token) {
            // Access token'ı blacklist'e ekle
            blacklistToken(token);
        }

        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (refreshToken && req.user) {
            // Refresh token'ı database'den sil
            await revokeRefreshToken(req.user.id, req.user.userType);
        }

        // Cookie'leri temizle
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({ message: 'Çıkış başarılı' });
    } catch (error) {
        res.status(500).json({ message: 'Çıkış sırasında hata oluştu' });
    }
});
```

**Logout İşlemleri:**
1. Access token blacklist'e eklenir (15dk sonra otomatik temizlenir)
2. Refresh token database'den silinir
3. Cookie'ler temizlenir
4. Frontend localStorage'ı da temizler

---

### 3.3 Middleware Sistemi

#### 3.3.1 Authentication Middleware (middleware/auth.js)

**1. authMiddleware (Genel)**
```javascript
const authMiddleware = async (req, res, next) => {
    try {
        // Token'ı al (önce header, sonra cookie)
        let token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({ message: 'Token bulunamadı' });
        }

        // Blacklist kontrolü
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Token geçersiz' });
        }

        // JWT verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
};
```

**2. adminAuthMiddleware**
```javascript
const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Önce genel auth kontrolü
        let token = req.headers.authorization?.split(' ')[1];
        if (!token) token = req.cookies.accessToken;
        if (!token) return res.status(401).json({ message: 'Token bulunamadı' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Admin mi kontrol et
        if (decoded.userType !== 'admin') {
            return res.status(403).json({ message: 'Yetkisiz erişim' });
        }

        // Admin database'de var mı?
        const admin = await AdminUser.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
        }

        req.user = decoded;
        req.adminUser = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }
};
```

**3. teacherAuthMiddleware**
```javascript
// adminAuthMiddleware ile aynı mantık, sadece teacher kontrolü yapar
```

**Middleware Chain Sırası:**
```
Request → authMiddleware / adminAuthMiddleware / teacherAuthMiddleware
         → validationMiddleware (route bazlı)
         → detectSuspiciousActivity (security)
         → Route Handler
```

#### 3.3.2 Validation Middleware (middleware/validation.js)

**Örnek: Teacher Validation**
```javascript
const validateTeacher = [
    body('tcId')
        .isLength({ min: 11, max: 11 }).withMessage('TC kimlik 11 haneli olmalı')
        .isNumeric().withMessage('TC kimlik sadece rakamlardan oluşmalı'),

    body('firstName')
        .isLength({ min: 2, max: 50 }).withMessage('Ad 2-50 karakter arası olmalı')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/).withMessage('Ad sadece harflerden oluşmalı'),

    body('birthDate')
        .isISO8601().withMessage('Geçersiz tarih formatı'),

    body('placementPoints')
        .isFloat({ min: 0, max: 999.99 }).withMessage('Puan 0-999.99 arası olmalı'),

    body('branch')
        .isLength({ min: 2, max: 100 }).withMessage('Branş 2-100 karakter arası olmalı'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
```

**Validation Zincirleme:**
1. Her field için ayrı kontrol
2. Hata mesajları Türkçe
3. Son middleware hataları toplar
4. Hata varsa 400 döner, yoksa next()

#### 3.3.3 Security Enhanced Middleware (middleware/securityEnhanced.js)

**Token Generation**
```javascript
const generateAccessToken = (payload) => {
    const tokenId = uuidv4();  // Benzersiz ID
    return jwt.sign(
        { ...payload, tokenId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = async (userId, userType) => {
    const tokenId = uuidv4();
    const refreshToken = jwt.sign(
        { id: userId, userType, tokenId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    // Database'e kaydet
    await pool.execute(
        `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [userId, userType, refreshToken]
    );

    return refreshToken;
};
```

**Token Blacklist**
```javascript
const tokenBlacklist = new Set();

const blacklistToken = (token) => {
    tokenBlacklist.add(token);

    // 15 dakika sonra otomatik temizle
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 15 * 60 * 1000);
};

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
```

**Neden In-Memory Blacklist?**
- Access token süresi sadece 15 dakika
- Production'da Redis kullanılmalı
- Multi-instance deployment için gerekli

**Suspicious Activity Detection**
```javascript
const detectSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /(\bor\b|\band\b).*=.*\'/i,  // SQL injection
        /<script[^>]*>.*?<\/script>/i,  // XSS
        /\.\.\/|\.\.\\|%2e%2e/i  // Path traversal
    ];

    const checkString = JSON.stringify(req.body) + req.query + req.params;

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            console.warn('Suspicious activity detected:', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                suspiciousData: checkString.substring(0, 100)
            });

            return res.status(400).json({
                message: 'Geçersiz istek tespit edildi'
            });
        }
    }

    next();
};
```

---

### 3.4 Database Models

#### 3.4.1 Teacher Model

```javascript
class Teacher {
    static async findByTcId(tcId) {
        const [rows] = await pool.execute(
            'SELECT * FROM teachers WHERE tc_id = ?',
            [tcId]
        );
        return rows[0];
    }

    static async create(teacherData) {
        const { tcId, firstName, lastName, birthDate, placementPoints, branch } = teacherData;

        // Doğum tarihini şifre olarak hash'le
        const passwordHash = await bcrypt.hash(birthDate, 10);

        await pool.execute(
            `INSERT INTO teachers (tc_id, first_name, last_name, birth_date,
             placement_points, branch, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tcId, firstName, lastName, birthDate, placementPoints, branch, passwordHash]
        );

        return this.findByTcId(tcId);
    }

    static async getAll(limit = 20, offset = 0, search = '') {
        let query = 'SELECT * FROM teachers';
        let params = [];

        if (search) {
            query += ' WHERE tc_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern, searchPattern];
        }

        query += ' ORDER BY placement_points DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // ... diğer metodlar
}
```

**Model Sorumluluğu:**
- Database operasyonlarını encapsulate eder
- Business logic içerir (şifre hashleme)
- SQL injection koruması (parameterized queries)

#### 3.4.2 Preference Model

```javascript
class Preference {
    static async savePreferences(teacherTcId, periodId, preferences) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Eski tercihleri sil
            await connection.execute(
                'DELETE FROM preferences WHERE teacher_tc_id = ? AND preference_period_id = ?',
                [teacherTcId, periodId]
            );

            // 2. Yeni tercihleri ekle
            if (preferences.length > 0) {
                const values = preferences.map(pref =>
                    [teacherTcId, pref.positionId, pref.rank, periodId]
                );
                const placeholders = preferences.map(() => '(?, ?, ?, ?)').join(', ');

                await connection.execute(
                    `INSERT INTO preferences (teacher_tc_id, position_id, preference_rank, preference_period_id)
                     VALUES ${placeholders}`,
                    values.flat()
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
```

**Transaction Kullanımı:**
- Tümü ya da hiçbiri (atomicity)
- Önce sil, sonra ekle stratejisi
- Error durumunda rollback
- Connection release (connection pool için önemli)

---

## 4. Frontend Detaylı Analiz

### 4.1 AuthContext (Global State)

```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Uygulama yüklendiğinde token verify et
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            // Token'ı axios header'a ekle
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            try {
                const response = await axios.get('/api/auth/verify');
                setUser(response.data.user);
            } catch (error) {
                // Token geçersizse refresh dene
                await tryRefreshToken();
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (credentials, userType) => {
        const endpoint = userType === 'admin'
            ? '/api/auth/admin/login'
            : '/api/auth/teacher/login';

        const response = await axios.post(endpoint, credentials);

        const { accessToken, user } = response.data;

        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', accessToken);

        // Axios default header'a ekle
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        setUser(user);
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const tryRefreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('/api/auth/refresh', { refreshToken });

            const { accessToken } = response.data;
            localStorage.setItem('token', accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Verify'ı tekrar dene
            const verifyResponse = await axios.get('/api/auth/verify');
            setUser(verifyResponse.data.user);
        } catch (error) {
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            isAuthenticated: !!user,
            isAdmin: user?.userType === 'admin',
            isTeacher: user?.userType === 'teacher'
        }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**Context Avantajları:**
- Global authentication state
- Tüm componentlerde erişilebilir
- Otomatik token refresh
- Loading state yönetimi

### 4.2 Protected Route

```javascript
const ProtectedRoute = ({ children, requiredUserType }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <div className="loading-spinner">Yükleniyor...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredUserType && user.userType !== requiredUserType) {
        const redirectPath = user.userType === 'admin'
            ? '/admin/dashboard'
            : '/teacher/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

// Kullanım
<Route path="/admin/*" element={
    <ProtectedRoute requiredUserType="admin">
        <AdminRoutes />
    </ProtectedRoute>
} />
```

**Route Koruma Mantığı:**
1. Loading varsa spinner göster
2. Authentication yoksa login'e yönlendir
3. User type uyuşmuyorsa doğru dashboard'a yönlendir
4. Her şey OK ise children'ı render et

### 4.3 Teacher Preferences Component

```javascript
const TeacherPreferences = () => {
    const [availablePositions, setAvailablePositions] = useState([]);
    const [myPreferences, setMyPreferences] = useState([]);
    const [periodStatus, setPeriodStatus] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [periodRes, positionsRes, preferencesRes] = await Promise.all([
            axios.get('/teacher/preferences/period-status'),
            axios.get('/teacher/preferences/positions'),
            axios.get('/teacher/preferences/my-preferences')
        ]);

        setPeriodStatus(periodRes.data);

        // Tercih edilmiş pozisyonları filtrele
        const preferredIds = new Set(preferencesRes.data.map(p => p.position_id));
        const available = positionsRes.data.filter(p => !preferredIds.has(p.id));

        setAvailablePositions(available);
        setMyPreferences(preferencesRes.data.sort((a, b) => a.rank - b.rank));
    };

    const addPreference = (position) => {
        if (myPreferences.length >= 25) {
            alert('En fazla 25 tercih yapabilirsiniz');
            return;
        }

        setMyPreferences([...myPreferences, position]);
        setAvailablePositions(availablePositions.filter(p => p.id !== position.id));
    };

    const movePreference = (index, direction) => {
        const newPreferences = [...myPreferences];
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= newPreferences.length) return;

        // Swap
        [newPreferences[index], newPreferences[newIndex]] =
        [newPreferences[newIndex], newPreferences[index]];

        setMyPreferences(newPreferences);
    };

    const handleSave = async () => {
        const preferencesToSave = myPreferences.map((pref, index) => ({
            positionId: pref.id || pref.position_id,
            rank: index + 1
        }));

        await axios.post('/teacher/preferences/save', {
            preferences: preferencesToSave
        });

        alert('Tercihler kaydedildi');
    };

    return (
        <div className="preferences-container">
            <div className="available-positions">
                <h2>Uygun Pozisyonlar</h2>
                {availablePositions.map(pos => (
                    <div key={pos.id} className="position-card">
                        <span>{pos.school_name} - {pos.district}</span>
                        <button onClick={() => addPreference(pos)}>Ekle</button>
                    </div>
                ))}
            </div>

            <div className="my-preferences">
                <h2>Tercihlerim ({myPreferences.length}/25)</h2>
                {myPreferences.map((pref, index) => (
                    <div key={pref.id || pref.position_id} className="preference-card">
                        <span className="rank">{index + 1}</span>
                        <span>{pref.school_name} - {pref.district}</span>
                        <button onClick={() => movePreference(index, -1)} disabled={index === 0}>▲</button>
                        <button onClick={() => movePreference(index, 1)} disabled={index === myPreferences.length - 1}>▼</button>
                        <button onClick={() => removePreference(pref)}>Sil</button>
                    </div>
                ))}
                <button onClick={handleSave}>Tercihleri Kaydet</button>
            </div>
        </div>
    );
};
```

**UI State Yönetimi:**
- İki liste: Uygun pozisyonlar vs Tercihlerim
- Pozisyon eklendiğinde array'ler arası taşıma
- Sıralama için swap algoritması
- Index + 1 = rank

---

## 5. Veritabanı Şeması

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐
│  admin_users    │
│  PK: id         │
│  • username     │ (1)
│  • password_hash│  │
│  • role         │  │
└─────────────────┘  │
                     │ created_by
                     ▼
┌─────────────────────────┐
│  preference_periods     │
│  PK: id                 │
│  • start_date           │
│  • end_date             │ (1)
│  • status               │  │
│  FK: created_by         │  │
└─────────────────────────┘  │
                             │
                             ▼
                    ┌────────────────┐
                    │  preferences   │
                    │  PK: id        │
                    │  FK: teacher_tc│
                    │  FK: position  │
                    │  FK: period    │
                    │  • rank        │
                    └────────────────┘
                        ▲         ▲
                (M)     │         │    (M)
                        │         │
            ┌───────────┘         └───────────┐
            │                                  │
    ┌───────┴────────┐              ┌─────────┴────────┐
    │   teachers     │              │   positions      │
    │   PK: tc_id    │              │   PK: id         │
    │   • first_name │              │   • school_name  │
    │   • last_name  │              │   • district     │
    │   • birth_date │              │   • branch       │
    │   • points     │              │   • quota        │
    │   • branch     │              │   • status       │
    └────────────────┘              └──────────────────┘

┌─────────────────────┐
│  refresh_tokens     │
│  PK: id             │
│  • user_id          │
│  • user_type        │
│  • token            │
│  • expires_at       │
└─────────────────────┘
```

### 5.2 Tablo Detayları

**admin_users**
```sql
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username)
);
```

**teachers**
```sql
CREATE TABLE teachers (
    tc_id VARCHAR(11) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    placement_points DECIMAL(5,2) DEFAULT 0.00,
    branch VARCHAR(100) NOT NULL,
    current_assignment VARCHAR(200),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_branch (branch),
    INDEX idx_points (placement_points)
);
```

**positions**
```sql
CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    quota INT DEFAULT 1,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch (branch),
    INDEX idx_district (district),
    INDEX idx_status (status)
);
```

**preference_periods**
```sql
CREATE TABLE preference_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
);
```

**preferences**
```sql
CREATE TABLE preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_tc_id VARCHAR(11) NOT NULL,
    position_id INT NOT NULL,
    preference_rank INT NOT NULL CHECK (preference_rank BETWEEN 1 AND 25),
    preference_period_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_tc_id) REFERENCES teachers(tc_id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (preference_period_id) REFERENCES preference_periods(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_position_period (teacher_tc_id, position_id, preference_period_id),
    UNIQUE KEY unique_teacher_rank_period (teacher_tc_id, preference_rank, preference_period_id),
    INDEX idx_teacher_period (teacher_tc_id, preference_period_id),
    INDEX idx_position (position_id)
);
```

**refresh_tokens**
```sql
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'teacher') NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id)
);
```

### 5.3 Kritik Constraint'ler

**Unique Constraints:**
1. `(teacher_tc_id, position_id, preference_period_id)` → Aynı pozisyon 1 kez seçilebilir
2. `(teacher_tc_id, preference_rank, preference_period_id)` → Aynı sıra 1 kez kullanılabilir

**Foreign Key Cascade:**
- Teacher silinirse tercihleri de silinir (CASCADE)
- Position silinirse tercihleri de silinir (CASCADE)
- Period silinirse tercihleri de silinir (CASCADE)
- Admin silinirse created_by NULL olur (SET NULL)

---

## 6. Kimlik Doğrulama Sistemi

### 6.1 Dual Token Sistemi

**Access Token (15 dakika):**
```javascript
{
    id: "12345",
    username: "admin",
    userType: "admin",
    tokenId: "uuid-v4",
    iat: 1696800000,
    exp: 1696800900  // 15 dakika sonra
}
```

**Refresh Token (7 gün):**
```javascript
{
    id: "12345",
    userType: "admin",
    tokenId: "uuid-v4",
    iat: 1696800000,
    exp: 1697404800  // 7 gün sonra
}
```

### 6.2 Token Flow Diyagramı

```
┌─────────┐
│  LOGIN  │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Generate Tokens     │
│ • Access (15m)      │
│ • Refresh (7d)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────┐
│ Store                       │
│ • Access → Cookie + LS      │
│ • Refresh → Cookie + LS + DB│
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ API Requests                │
│ Header: Bearer <access>     │
└─────────────┬───────────────┘
              │
              ▼
        ┌─────┴─────┐
        │  Expired? │
        └─────┬─────┘
         Yes  │  No
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────┐      ┌──────────┐
│ REFRESH │      │ Continue │
└────┬────┘      └──────────┘
     │
     ▼
┌─────────────────────┐
│ POST /auth/refresh  │
│ Body: refreshToken  │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────┐
│ Verify Refresh       │
│ • JWT verify         │
│ • DB check           │
│ • Expiry check       │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ New Access Token     │
│ Update Cookie + LS   │
└──────────────────────┘
```

### 6.3 Security Features

**HTTP-Only Cookies:**
- JavaScript erişemez
- XSS saldırılarına karşı koruma

**SameSite=Strict:**
- CSRF saldırılarına karşı koruma
- Cookie sadece same-site requestlerde gönderilir

**Secure Flag:**
- Production'da sadece HTTPS üzerinden

**Token Blacklist:**
- Logout sonrası token geçersiz
- In-memory (15dk sonra otomatik temizlenir)
- Production'da Redis kullanılmalı

---

## 7. Güvenlik Mekanizmaları

### 7.1 Saldırı Korumaları

**1. SQL Injection**
```javascript
// ❌ KÖTÜ
const query = `SELECT * FROM users WHERE username = '${username}'`;

// ✅ İYİ
const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
);
```

**2. XSS (Cross-Site Scripting)**
```javascript
// Middleware ile pattern detection
const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i
];

// Content Security Policy (CSP) header
helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],  // Inline script yasak
        styleSrc: ["'self'", "'unsafe-inline'"]
    }
});
```

**3. CSRF (Cross-Site Request Forgery)**
- SameSite=strict cookie
- Token header'da Bearer ile gönderilir
- Origin check (CORS)

**4. Brute Force**
```javascript
// Login endpoint rate limit
max: 20,  // IP başına 20 deneme
windowMs: 15 * 60 * 1000,  // 15 dakikada
skipSuccessfulRequests: true  // Başarılı loginler sayılmaz
```

**5. DDoS**
```javascript
// Genel API rate limit
max: 300,  // IP başına 300 istek
windowMs: 15 * 60 * 1000  // 15 dakikada
```

### 7.2 Güvenlik Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

---

## 8. İş Akışları

### 8.1 Öğretmen Tercih Akışı

```
1. Öğretmen Login
   ├─ TC Kimlik + Doğum Tarihi
   └─ Token alır

2. Dashboard'a Yönlenir
   └─ Aktif dönem var mı kontrol eder

3. Tercih Sayfasına Girer
   ├─ GET /teacher/preferences/period-status
   ├─ GET /teacher/preferences/positions/:periodId
   └─ GET /teacher/preferences/my-preferences/:periodId

4. Pozisyon Seçer (Uygun Pozisyonlar → Tercihlerim)
   ├─ Local state güncellenir
   └─ Maksimum 25 kontrol edilir

5. Sıralama Yapar (▲▼ butonları)
   └─ Array swap ile sıra değişir

6. Kaydet Butonuna Basar
   ├─ POST /teacher/preferences/save
   ├─ Backend validasyonları:
   │   ├─ Dönem aktif mi?
   │   ├─ Max 25 mi?
   │   ├─ Duplicate pozisyon/rank var mı?
   │   ├─ Branş kontrolü (case-insensitive)
   │   └─ Pozisyonlar aktif mi?
   └─ Transaction ile kaydedilir

7. Başarı Mesajı
   └─ Tercihler tekrar fetch edilir
```

### 8.2 Admin Atama Akışı (Planlanan)

```
1. Admin Tercih Dönemi Kapanışı
   └─ Manuel veya otomatik status = 'completed'

2. Atama Algoritması Çalıştırılır
   ├─ Tüm tercihleri al (period_id bazlı)
   ├─ Öğretmenleri puana göre sırala (DESC)
   └─ For each teacher (yüksek puandan başla):
       ├─ Tercihlerini sırayla kontrol et (rank ASC)
       ├─ Pozisyonun kontenjanı var mı?
       │   ├─ Varsa: Ata, kontanjanı azalt
       │   └─ Yoksa: Bir sonraki tercihine geç
       └─ Hiç atanamazsa: "Açıkta kaldı" listesine ekle

3. Atama Sonuçları Kaydedilir
   └─ assignments tablosuna INSERT

4. Raporlama
   ├─ Atanan öğretmenler
   ├─ Açıkta kalan öğretmenler
   └─ Doluluk oranları
```

### 8.3 Token Refresh Akışı

```
Frontend:
  │
  ▼
1. API Request (Access Token ile)
  │
  ▼
2. Backend: Token Expired (401)
  │
  ▼
3. Frontend: Axios Interceptor
   ├─ Error 401 algıla
   └─ tryRefreshToken() çağır
       │
       ▼
4. POST /api/auth/refresh
   ├─ Body: { refreshToken }
   │
   ▼
5. Backend:
   ├─ JWT.verify(refreshToken)
   ├─ Database'de var mı?
   ├─ Expire olmamış mı?
   └─ Yeni access token oluştur
       │
       ▼
6. Frontend:
   ├─ Yeni token localStorage'a kaydet
   ├─ Axios header'ı güncelle
   └─ Original request'i tekrarla
       │
       ▼
7. Success!

Refresh Token da Expired ise:
  └─ logout() → Login sayfasına yönlendir
```

---

## 9. API Referansı

### 9.1 Authentication Endpoints

**POST /api/auth/admin/login**
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response (200):
{
  "message": "Giriş başarılı",
  "user": {
    "id": 1,
    "username": "admin",
    "userType": "admin"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}

Cookies Set:
- accessToken (httpOnly, 15m)
- refreshToken (httpOnly, 7d)
```

**POST /api/auth/teacher/login**
```json
Request:
{
  "tcId": "12345678901",
  "birthDate": "15.05.1985"
}

Response (200):
{
  "message": "Giriş başarılı",
  "user": {
    "tcId": "12345678901",
    "firstName": "Mehmet",
    "lastName": "Yılmaz",
    "userType": "teacher"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**POST /api/auth/refresh**
```json
Request:
{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "user": { ... }
}

Response (401):
{
  "message": "Token yenileme başarısız"
}
```

### 9.2 Admin Endpoints

**GET /api/admin/teachers**
```
Query Params:
- limit: number (default: 20)
- offset: number (default: 0)
- search: string

Response (200):
{
  "teachers": [ ... ],
  "total": 150
}
```

**POST /api/admin/teachers**
```json
Request:
{
  "tcId": "12345678901",
  "firstName": "Ali",
  "lastName": "Veli",
  "birthDate": "1990-01-15",
  "placementPoints": 85.5,
  "branch": "Matematik"
}

Response (201):
{
  "message": "Öğretmen başarıyla eklendi",
  "teacher": { ... }
}
```

**GET /api/admin/periods**
```json
Response (200):
[
  {
    "id": 1,
    "start_date": "2025-10-01T00:00:00.000Z",
    "end_date": "2025-10-15T23:59:59.000Z",
    "status": "active",
    "created_by": 1
  }
]
```

### 9.3 Teacher Endpoints

**GET /api/teacher/preferences/my-preferences/:periodId**
```json
Response (200):
{
  "preferences": [
    {
      "id": 1,
      "position_id": 5,
      "preference_rank": 1,
      "school_name": "Ankara Çankaya İlkokulu",
      "district": "Çankaya",
      "branch": "Matematik"
    }
  ],
  "period": { ... },
  "isActive": true,
  "canEdit": true
}
```

**POST /api/teacher/preferences/save**
```json
Request:
{
  "periodId": 1,
  "preferences": [
    { "positionId": 5, "rank": 1 },
    { "positionId": 12, "rank": 2 }
  ]
}

Response (200):
{
  "message": "Tercihler başarıyla kaydedildi"
}

Response (400):
{
  "message": "Sadece kendi branşınıza ait pozisyonları seçebilirsiniz"
}
```

---

## 10. Önemli Özellikler

### 10.1 Tercih Sistemi Kuralları

1. **Maksimum Tercih**: 25
2. **Branş Kontrolü**: Sadece kendi branşına tercih yapabilir (case-insensitive)
3. **Unique Pozisyon**: Aynı pozisyon 1 kez seçilebilir
4. **Unique Rank**: Aynı sıra 1 kez kullanılabilir
5. **Dönem Kontrolü**: Sadece aktif dönemde tercih yapılabilir
6. **Transaction**: Tümü ya da hiçbiri kaydedilir

### 10.2 Şifre Yönetimi

**Öğretmenler:**
- Doğum tarihi GG.AA.YYYY formatında şifre olarak kullanılır
- Örnek: 15.05.1985 → bcrypt hash
- TC kimlik login için, doğum tarihi şifre için

**Adminler:**
- Güçlü şifre kuralları:
  - Min 8 karakter
  - En az 1 büyük harf
  - En az 1 küçük harf
  - En az 1 rakam
- bcrypt hash (10 rounds)

### 10.3 Tarih Format İşlemleri

**Frontend (Türkçe):**
- Kullanıcı girişi: GG.AA.YYYY
- Display: GG.AA.YYYY

**Backend/Database (ISO):**
- Storage: YYYY-MM-DD
- API: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

**Dönüşüm:**
```javascript
// Frontend → Backend
const [day, month, year] = birthDate.split('.');
const isoDate = `${year}-${month}-${day}`;

// Backend → Frontend
const date = new Date(isoDate);
const formatted = date.toLocaleDateString('tr-TR');
```

### 10.4 Dönem Durum Yönetimi

**Otomatik Güncelleme:**
```javascript
// Her API call'da çalışır
PreferencePeriod.updateStatus();

// Mantık:
if (NOW >= start_date && NOW <= end_date) {
    status = 'active';
} else if (NOW > end_date) {
    status = 'completed';
} else {
    status = 'upcoming';
}
```

**Manuel Güncelleme:**
```
PATCH /api/admin/periods/:id/status
Body: { status: 'completed' }
```

### 10.5 Production vs Development

**Development:**
- Setup endpoint açık (`/api/setup-db`)
- Detaylı error messages
- CORS: localhost:3000
- Secure cookies: false

**Production:**
- Setup endpoint kapalı
- Generic error messages
- CORS: Sadece production domain
- Secure cookies: true
- HTTPS redirect
- HSTS headers

---

## Sonuç

Bu dokümantasyon, Norm Atama Sistemi'nin tüm teknik detaylarını kapsar. Sistem iyi yapılandırılmış, güvenli ve ölçeklenebilir bir mimari üzerine kurulmuştur.

**Güçlü Yanlar:**
- ✅ Temiz mimari (MVC pattern)
- ✅ Kapsamlı güvenlik (helmet, rate limiting, validation)
- ✅ Dual token authentication
- ✅ Transaction kullanımı
- ✅ Error handling

**Geliştirilebilir Alanlar:**
- Redis cache (token blacklist için)
- Automated assignment algorithm
- Email notifications
- Advanced reporting
- Unit/Integration tests

---

**Versiyon:** 1.1.1
**Son Güncelleme:** 4 Ekim 2025
