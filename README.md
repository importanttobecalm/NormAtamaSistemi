# Norm Fazlası Öğretmen Atama Sistemi

Bu proje, norm fazlası öğretmenlerin yerleştirme sürecini dijitalleştirmek için geliştirilmiş bir web uygulamasıdır.

## 🎯 Proje Amacı

Mevcut durumda manuel olarak yürütülen norm fazlası öğretmen atama sürecini dijitalleştirerek:
- Şeffaf ve adil bir atama süreci sağlamak
- Zaman tasarrufu ve hata oranını düşürmek
- Öğretmenlerin online tercih yapabilmesini sağlamak
- Yöneticilerin süreci kolayca takip edebilmesini sağlamak

## 🏗️ Teknik Altyapı

### Backend
- **Framework**: Node.js + Express.js
- **Veritabanı**: MySQL
- **Kimlik Doğrulama**: JWT (JSON Web Tokens)
- **Güvenlik**: bcryptjs, helmet, express-rate-limit
- **Doğrulama**: express-validator

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI**: Custom CSS + Font Awesome icons
- **State Management**: React Context API

## 📋 Özellikler

### Yönetici Modülü
- ✅ Güvenli giriş sistemi
- ✅ Dashboard ve istatistikler
- 🚧 Öğretmen yönetimi (CRUD işlemleri)
- 🚧 Açık pozisyon yönetimi
- 🚧 Tercih dönemi yönetimi
- 🚧 Toplu içe aktarma (Excel/CSV)
- 🚧 Raporlama ve dışa aktarma

### Öğretmen Modülü
- ✅ TC kimlik no + doğum tarihi ile giriş
- ✅ Kişisel bilgileri görüntüleme
- ✅ Dashboard ve tercih durumu takibi
- 🚧 Tercih yapma ve düzenleme
- 🚧 Geri sayım sayacı
- 🚧 Sürükle-bırak tercih sıralaması

**Açıklama**: ✅ Tamamlandı, 🚧 Geliştirilme aşamasında

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- MySQL (v8.0 veya üzeri)
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd NormAtamaSistemi
```

### 2. Bağımlılıkları Yükleyin
```bash
# Ana dizinde
npm install

# Server ve client bağımlılıklarını yükle
npm run install-all
```

### 3. Veritabanını Kurun
```bash
# MySQL'e bağlanın ve schema.sql dosyasını çalıştırın
mysql -u root -p < server/database/schema.sql
```

### 4. Ortam Değişkenlerini Ayarlayın
```bash
# server/.env.example dosyasını server/.env olarak kopyalayın
cp server/.env.example server/.env

# .env dosyasını düzenleyin:
# - DB_PASSWORD: MySQL şifrenizi girin
# - JWT_SECRET: Güvenli bir secret key girin
```

### 5. Uygulamayı Başlatın
```bash
# Geliştirme modu (hem server hem client)
npm run dev

# Sadece server
npm run server

# Sadece client
npm run client
```

### 6. Uygulamaya Erişin
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 👥 Giriş Bilgileri

### Test Yöneticisi
- **Kullanıcı Adı**: admin
- **Şifre**: admin123

### Test Öğretmenleri
- **TC**: 12345678901, **Doğum Tarihi**: 15.05.1985
- **TC**: 12345678902, **Doğum Tarihi**: 22.03.1982
- **TC**: 12345678903, **Doğum Tarihi**: 08.11.1988

## 📊 Veritabanı Yapısı

### Ana Tablolar
- `admin_users`: Yönetici kullanıcıları
- `teachers`: Öğretmen bilgileri
- `positions`: Açık pozisyonlar
- `preference_periods`: Tercih dönemleri
- `preferences`: Öğretmen tercihleri

## 🛡️ Güvenlik

- HTTPS/SSL desteği
- Password hashing (bcryptjs)
- JWT token tabanlı kimlik doğrulama
- Rate limiting (DDoS koruması)
- SQL injection koruması
- XSS koruması
- Input validation

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Yönetici girişi
- `POST /api/auth/teacher/login` - Öğretmen girişi
- `GET /api/auth/verify` - Token doğrulama

### Admin APIs
- `GET /api/admin/teachers` - Öğretmen listesi
- `POST /api/admin/teachers` - Öğretmen ekleme
- `PUT /api/admin/teachers/:tcId` - Öğretmen güncelleme
- `DELETE /api/admin/teachers/:tcId` - Öğretmen silme

### Teacher APIs
- `GET /api/teacher/profile/info` - Profil bilgileri
- `GET /api/teacher/preferences/my-preferences` - Tercihlerim
- `POST /api/teacher/preferences/save` - Tercih kaydetme

## 🏃‍♂️ Geliştirme

### Proje Yapısı
```
NormAtamaSistemi/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Yeniden kullanılabilir bileşenler
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── pages/          # Sayfa bileşenleri
│   │   └── ...
├── server/                 # Node.js backend
│   ├── config/            # Veritabanı yapılandırması
│   ├── middleware/        # Express middleware
│   ├── models/            # Veritabanı modelleri
│   ├── routes/            # API routes
│   └── database/          # SQL şemaları
└── docs/                  # Dokümantasyon
```

### Geliştirme Komutları
```bash
npm run dev          # Hem server hem client'ı başlat
npm run server       # Sadece server'ı başlat
npm run client       # Sadece client'ı başlat
npm run build        # Production build
```

## 📈 Gelecek Sürümler

### v1.1 (Yakında)
- Tam tercih yönetimi sistemi
- Sürükle-bırak tercih sıralaması
- Gelişmiş admin paneli
- Toplu içe aktarma

### v1.2 (Planlanan)
- E-posta bildirimleri
- Otomatik yerleştirme algoritması
- Gelişmiş raporlama
- Mobile-first tasarım

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje ile ilgili sorularınız için GitHub Issues kullanabilirsiniz.

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir. Üretim ortamında kullanmadan önce kapsamlı güvenlik testleri yapılmalıdır.