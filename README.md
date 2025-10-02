# Norm Fazlası Öğretmen Atama Sistemi

> Norm fazlası öğretmenlerin yerleştirme sürecini dijitalleştiren, güvenli ve şeffaf bir web uygulaması.

[![Production](https://img.shields.io/badge/production-live-brightgreen)](https://normatamasistemi-production.up.railway.app)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.x-blue)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/mysql-8.0-orange)](https://www.mysql.com)

## 🎯 Proje Amacı

Mevcut durumda manuel olarak yürütülen norm fazlası öğretmen atama sürecini dijitalleştirerek:
- ✅ Şeffaf ve adil bir atama süreci sağlamak
- ✅ Zaman tasarrufu ve hata oranını düşürmek
- ✅ Öğretmenlerin online tercih yapabilmesini sağlamak
- ✅ Yöneticilerin süreci kolayca takip edebilmesini sağlamak

## 📱 Demo

**Production URL:** https://normatamasistemi-production.up.railway.app

### Test Hesapları

**Yönetici Girişi:**
- Kullanıcı Adı: `admin`
- Şifre: `Admin123` (İlk kurulumda değiştirin!)

**Öğretmen Girişi:**
- TC: `12345678901` / Doğum Tarihi: `15.05.1985`
- TC: `12345678902` / Doğum Tarihi: `22.03.1982`
- TC: `12345678903` / Doğum Tarihi: `08.11.1988`

## 🏗️ Teknik Altyapı

### Backend Stack
- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (Access + Refresh Tokens)
- **Security:** Helmet, Rate Limiting, bcrypt, HPP
- **Validation:** express-validator

### Frontend Stack
- **Framework:** React 18
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **State Management:** Context API
- **Styling:** Custom CSS (Responsive)

### DevOps
- **Deployment:** Railway (Docker)
- **CI/CD:** Automatic deployment from GitHub
- **Database:** Railway MySQL
- **SSL/TLS:** Automatic HTTPS

## ✨ Özellikler

### 👨‍💼 Yönetici Modülü

#### Tamamlanmış Özellikler
- ✅ Güvenli giriş sistemi (JWT + bcrypt)
- ✅ Dashboard ve genel istatistikler
- ✅ **Öğretmen Yönetimi**
  - CRUD işlemleri (Create, Read, Update, Delete)
  - Arama ve filtreleme
  - Toplu silme
  - Pagination
- ✅ **Pozisyon Yönetimi**
  - Açık pozisyon ekleme/düzenleme/silme
  - Kontenjan takibi
  - Branş bazlı filtreleme
- ✅ **Tercih Dönemi Yönetimi**
  - Dönem oluşturma ve yönetimi
  - Otomatik başlangıç/bitiş
  - Aktif dönem takibi
- ✅ **Toplu İçe Aktarma**
  - Excel ile öğretmen aktarma
  - Excel ile pozisyon aktarma
  - Hata yönetimi ve validation
- ✅ **İstatistikler**
  - Atama sonuçları görüntüleme
  - Pozisyon doluluk oranları
  - Açıkta kalan öğretmenler listesi
- ✅ **Raporlama**
  - Excel rapor dışa aktarma
  - Öğretmen tercihleri raporu
  - Atama sonuçları raporu
  - Pozisyon durumları raporu

### 👨‍🏫 Öğretmen Modülü

- ✅ TC Kimlik No + Doğum Tarihi ile giriş
- ✅ Kişisel bilgileri görüntüleme
- ✅ Dashboard ve tercih durumu takibi
- ✅ **Tercih Yapma Sistemi**
  - Aktif dönem kontrolü
  - 1-25 arası sıralı tercih yapma
  - Sürükle-bırak ile sıralama
  - Otomatik kaydetme
  - Geri sayım sayacı
- ✅ Tercih güncelleme ve silme

## 🚀 Kurulum

### Gereksinimler

- Node.js v16 veya üzeri
- MySQL 8.0 veya üzeri
- npm veya yarn

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/importanttobecalm/NormAtamaSistemi.git
cd NormAtamaSistemi
```

### 2. Bağımlılıkları Yükleyin

```bash
# Ana dizinde
npm install

# Server ve client bağımlılıklarını tek komutla yükle
npm run install-all
```

### 3. MySQL Veritabanını Kurun

```bash
# MySQL'e bağlanın
mysql -u root -p

# Schema'yı import edin
mysql -u root -p < server/database/schema.sql
```

### 4. Environment Variables Ayarlayın

```bash
# server/.env.example'ı kopyalayın
cp server/.env.example server/.env

# .env dosyasını düzenleyin
nano server/.env
```

**Önemli:** Production için JWT secrets'ları mutlaka değiştirin!

```bash
# Güçlü secret oluşturun:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Uygulamayı Başlatın

**Geliştirme Modu** (Hot reload):
```bash
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:3000
```

**Production Build**:
```bash
# Client build
cd client && npm run build

# Production start
cd ../server && NODE_ENV=production npm start
```

### 6. İlk Admin Kullanıcısını Oluşturun

```bash
# Schema.sql içinde default admin var:
# Username: admin
# Password: admin123

# ⚠️ UYARI: İlk giriş sonrası şifreyi mutlaka değiştirin!
```

## 📊 Veritabanı Şeması

### Ana Tablolar

| Tablo | Açıklama |
|-------|----------|
| `admin_users` | Yönetici kullanıcı bilgileri |
| `teachers` | Öğretmen profilleri ve puanları |
| `positions` | Açık pozisyon bilgileri |
| `preference_periods` | Tercih dönemleri |
| `preferences` | Öğretmen tercihleri (1-25 sıralı) |
| `assignments` | Atama sonuçları |

**İlişkiler:**
- Teachers 1:N Preferences
- Positions 1:N Preferences
- PreferencePeriods 1:N Preferences
- Teachers 1:N Assignments

## 🔒 Güvenlik Özellikleri

### Kimlik Doğrulama
- ✅ JWT Access Tokens (15 dakika)
- ✅ JWT Refresh Tokens (7 gün)
- ✅ HTTP-only Cookies (SameSite=strict)
- ✅ Token Blacklist (Logout)
- ✅ bcrypt Password Hashing (10 rounds)

### Network Güvenliği
- ✅ HTTPS Redirect (Production)
- ✅ HSTS Headers
- ✅ Rate Limiting (300 req/15min)
- ✅ Login Rate Limiting (20 attempts/15min)
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ Content Security Policy (CSP)

### Input Validation
- ✅ express-validator
- ✅ SQL Injection Prevention
- ✅ XSS Protection
- ✅ HTTP Parameter Pollution (HPP)
- ✅ Suspicious Activity Detection

**Detaylı Güvenlik Kontrol Listesi:** [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md)

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/admin/login       # Yönetici girişi
POST   /api/auth/teacher/login     # Öğretmen girişi
GET    /api/auth/verify            # Token doğrulama
POST   /api/auth/refresh           # Token yenileme
POST   /api/auth/logout            # Çıkış (token blacklist)
```

### Admin - Teachers
```
GET    /api/admin/teachers         # Öğretmen listesi
POST   /api/admin/teachers         # Öğretmen ekleme
PUT    /api/admin/teachers/:tcId   # Öğretmen güncelleme
DELETE /api/admin/teachers/:tcId   # Öğretmen silme
GET    /api/admin/teachers/count   # Öğretmen sayısı
```

### Admin - Positions
```
GET    /api/admin/positions        # Pozisyon listesi
POST   /api/admin/positions        # Pozisyon ekleme
PUT    /api/admin/positions/:id    # Pozisyon güncelleme
DELETE /api/admin/positions/:id    # Pozisyon silme
```

### Admin - Periods
```
GET    /api/admin/periods          # Dönem listesi
POST   /api/admin/periods          # Dönem oluşturma
PUT    /api/admin/periods/:id      # Dönem güncelleme
DELETE /api/admin/periods/:id      # Dönem silme
GET    /api/admin/periods/active   # Aktif dönem
```

### Admin - Import
```
POST   /api/admin/import/teachers  # Excel öğretmen import
POST   /api/admin/import/positions # Excel pozisyon import
```

### Admin - Assignments
```
POST   /api/admin/assignments/run/:periodId     # Atama algoritması çalıştır
GET    /api/admin/assignments/statistics/:id    # Atama istatistikleri
```

### Admin - Reports
```
GET    /api/admin/reports/teachers/:periodId    # Öğretmen tercihleri (Excel)
GET    /api/admin/reports/assignments/:periodId # Atama sonuçları (Excel)
GET    /api/admin/reports/positions/:periodId   # Pozisyon durumları (Excel)
```

### Teacher - Profile
```
GET    /api/teacher/profile/info   # Profil bilgileri
```

### Teacher - Preferences
```
GET    /api/teacher/preferences/my-preferences/:periodId  # Tercihlerim
POST   /api/teacher/preferences/save                      # Tercih kaydet
GET    /api/teacher/preferences/positions/:periodId       # Uygun pozisyonlar
GET    /api/teacher/preferences/active-period             # Aktif dönem
```

## 📁 Proje Yapısı

```
NormAtamaSistemi/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/                # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── TeacherManagement.js
│   │   │   │   ├── PositionManagement.js
│   │   │   │   ├── PeriodManagement.js
│   │   │   │   ├── BulkImport.jsx
│   │   │   │   ├── Statistics.jsx
│   │   │   │   └── Reports.jsx
│   │   │   ├── teacher/             # Teacher pages
│   │   │   │   ├── TeacherDashboard.js
│   │   │   │   ├── TeacherInfo.js
│   │   │   │   └── TeacherPreferences.js
│   │   │   └── Login.js
│   │   ├── styles/                  # CSS files
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   └── database.js              # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   ├── securityEnhanced.js      # Token management
│   │   └── validation.js            # Input validation
│   ├── models/
│   │   ├── AdminUser.js
│   │   ├── Teacher.js
│   │   ├── Position.js
│   │   ├── PreferencePeriod.js
│   │   └── Preference.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin/
│   │   │   ├── teachers.js
│   │   │   ├── positions.js
│   │   │   ├── periods.js
│   │   │   ├── import.js
│   │   │   ├── assignments.js
│   │   │   └── reports.js
│   │   └── teacher/
│   │       ├── profile.js
│   │       └── preferences.js
│   ├── database/
│   │   ├── schema.sql               # Database schema
│   │   └── assignments_table.sql
│   ├── .env.example
│   ├── index.js                     # Server entry point
│   └── package.json
│
├── Dockerfile                       # Production Docker build
├── docker-compose.yml               # Local development
├── .gitignore
├── .dockerignore
├── SECURITY-CHECKLIST.md            # Security guidelines
├── SECURITY.md                      # Security documentation
├── CLAUDE.md                        # Development guide
├── README.md                        # This file
└── package.json                     # Root package
```

## 🚢 Deployment

### Railway Deployment (Otomatik)

1. **GitHub'a Push**
   ```bash
   git push origin main
   ```

2. **Railway Otomatik Deploy**
   - Railway GitHub'dan değişiklikleri algılar
   - Docker build başlar
   - Deployment tamamlanır (~2-3 dakika)

3. **Environment Variables (Railway)**
   ```
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   JWT_REFRESH_SECRET=<another-strong-secret>
   DB_HOST=<railway-mysql-host>
   DB_PORT=<railway-mysql-port>
   DB_USER=root
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=railway
   ```

### Docker Deployment

```bash
# Build image
docker build -t norm-atama-sistemi .

# Run container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  -e DB_HOST=your-db-host \
  norm-atama-sistemi
```

### Local Docker Compose

```bash
# Start MySQL + App
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🛠️ Geliştirme

### Komutlar

```bash
npm run dev          # Server + Client (concurrent)
npm run server       # Sadece server (port 5000)
npm run client       # Sadece client (port 3000)
npm run build        # Client production build
npm start            # Production server
npm run install-all  # Tüm dependencies
```

### Environment Modes

**Development:**
- Hot reload aktif
- Error stack traces gösterilir
- CORS tüm origin'lere açık
- CSP devre dışı

**Production:**
- Optimized build
- Error details gizli
- HTTPS redirect
- CSP aktif
- HSTS headers

## 📈 Roadmap

### v1.1 (Tamamlandı ✅)
- ✅ Tam CRUD öğretmen yönetimi
- ✅ Pozisyon yönetimi
- ✅ Tercih dönemi yönetimi
- ✅ Sürükle-bırak tercih sıralaması
- ✅ Toplu Excel import
- ✅ İstatistikler ve raporlama
- ✅ Atama algoritması

### v1.2 (Planlanan)
- [ ] E-posta bildirimleri
- [ ] Şifre sıfırlama (forgot password)
- [ ] Gelişmiş filtreleme ve arama
- [ ] Dark mode
- [ ] Mobil uygulama (React Native)
- [ ] Admin rolleri ve yetkiler
- [ ] Audit logging dashboard

### v1.3 (Gelecek)
- [ ] Real-time bildirimler (WebSocket)
- [ ] Chatbot desteği
- [ ] Multi-language support
- [ ] PDF sertifika oluşturma
- [ ] Integration with MEB systems

## 🐛 Sorun Giderme

### Database Connection Error

```bash
# MySQL servisini kontrol edin
# Windows:
net start MySQL80

# Linux/Mac:
sudo systemctl start mysql
```

### Port 3000/5000 Already in Use

```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### JWT Token Expired

- Access token süresi 15 dakikadır
- Otomatik refresh çalışmalıdır
- Çalışmıyorsa logout/login yapın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit yapın:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push edin:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim & Destek

- **GitHub Issues:** [Sorun bildir](https://github.com/importanttobecalm/NormAtamaSistemi/issues)
- **GitHub Discussions:** [Soru sor](https://github.com/importanttobecalm/NormAtamaSistemi/discussions)

## 👥 Contributors

Bu proje aşağıdaki kişiler tarafından geliştirilmiştir:

### Core Team

**[@importanttobecalm](https://github.com/importanttobecalm)**
- 💻 Project Owner & Lead Developer
- 🏗️ System Architecture & Design
- 🎨 UI/UX Implementation
- 📊 Database Design
- 🚀 DevOps & Deployment

**Claude (Anthropic AI)**
- 🤖 AI Development Assistant
- 💡 Code Architecture & Best Practices
- 🔒 Security Implementation & Hardening
- 📝 Documentation & Technical Writing
- 🐛 Bug Detection & Resolution
- ⚡ Performance Optimization

### Katkılar

- Backend API geliştirme (Express.js + MySQL)
- Frontend UI/UX tasarımı (React)
- JWT authentication & security sistemi
- Excel import/export özellikleri
- Atama algoritması implementasyonu
- Production deployment & optimization
- Comprehensive documentation

**Katkıda bulunmak ister misiniz?** [CONTRIBUTING.md](./CONTRIBUTING.md) dosyasını inceleyin veya issue açın!

---

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak projelerini kullanmaktadır:

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MySQL](https://www.mysql.com/)
- [Railway](https://railway.app/)
- [Helmet](https://helmetjs.github.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [ExcelJS](https://github.com/exceljs/exceljs)

---

**Not:** Bu proje eğitim ve araştırma amaçlıdır. Production kullanımı öncesinde [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md) dosyasını mutlaka inceleyin.

**Son Güncelleme:** 2 Ekim 2025
**Versiyon:** 1.1.0
**Durum:** ✅ Production Ready
