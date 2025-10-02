# 🚀 Kurulum Rehberi - Norm Fazlası Öğretmen Atama Sistemi

Bu rehber, projeyi sıfırdan kurmak için gerekli adımları detaylı olarak açıklamaktadır.

## 📋 Sistem Gereksinimleri

### Yazılım Gereksinimleri
- **Node.js** v16.0.0 veya üzeri
- **MySQL** v8.0 veya üzeri
- **npm** v8.0.0 veya üzeri (Node.js ile gelir)
- **Git** (opsiyonel, kaynak kod yönetimi için)

### Donanım Gereksinimleri
- **RAM**: Minimum 4GB (8GB önerilen)
- **Disk**: 2GB boş alan
- **İşlemci**: Modern çift çekirdekli işlemci

## 🔧 Adım 1: Node.js Kurulumu

### Windows
1. [Node.js resmi sitesinden](https://nodejs.org) LTS sürümünü indirin
2. İndirilen .msi dosyasını çalıştırın
3. Kurulum sihirbazını takip edin
4. Komut istemini açın ve doğrulayın:
```bash
node --version
npm --version
```

### macOS
```bash
# Homebrew ile
brew install node

# Veya resmi siteden indirin
```

### Linux (Ubuntu/Debian)
```bash
# NodeSource repository ekleyin
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

# Node.js'i kurun
sudo apt-get install -y nodejs
```

## 🗄️ Adım 2: MySQL Kurulumu

### Windows
1. [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) indirin
2. MySQL Installer'ı çalıştırın
3. "Developer Default" kurulumunu seçin
4. Root şifresini ayarlayın (güvenli bir şifre seçin)

### macOS
```bash
# Homebrew ile
brew install mysql

# MySQL'i başlatın
brew services start mysql

# Root şifresini ayarlayın
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
# MySQL'i kurun
sudo apt update
sudo apt install mysql-server

# Güvenlik ayarlarını yapın
sudo mysql_secure_installation
```

## 📁 Adım 3: Proje Dosyalarını Hazırlama

### Yöntem 1: Dosyaları Kopyalama
Bu rehberi takip ediyorsanız, proje dosyaları zaten mevcut. Proje dizinine gidin:
```bash
cd C:\Users\Importanttobecalm\Desktop\NormAtamaSistemi
```

### Yöntem 2: Git ile Klonlama (Eğer repository varsa)
```bash
git clone <repository-url>
cd NormAtamaSistemi
```

## 📦 Adım 4: Bağımlılıkları Yükleme

Proje dizininde terminal/komut istemi açın ve şu komutu çalıştırın:

```bash
# Tüm bağımlılıkları yükle (root, server, client)
npm run install-all
```

Eğer yukarıdaki komut çalışmazsa, manuel olarak yükleyin:

```bash
# Ana dizin bağımlılıkları
npm install

# Server bağımlılıkları
cd server
npm install

# Client bağımlılıkları
cd ../client
npm install

# Ana dizine geri dön
cd ..
```

## 🗃️ Adım 5: Veritabanı Kurulumu

### 5.1 MySQL'e Bağlanma
```bash
# MySQL'e root kullanıcısı ile bağlanın
mysql -u root -p
```

### 5.2 Veritabanı ve Tabloları Oluşturma

**Yöntem 1: SQL dosyasını çalıştırma**
```bash
# Komut satırından
mysql -u root -p < server/database/schema.sql
```

**Yöntem 2: MySQL konsolu içinden**
```sql
-- MySQL konsolu içinde
SOURCE server/database/schema.sql;
```

**Yöntem 3: Manuel oluşturma**
MySQL konsolunda şu komutları çalıştırın:
```sql
-- Veritabanını oluştur
CREATE DATABASE norm_atama_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE norm_atama_db;

-- Tabloları oluşturmak için server/database/schema.sql dosyasındaki SQL komutlarını kopyalayıp yapıştırın
```

### 5.3 Veritabanı Bağlantısını Doğrulama
```sql
-- Tabloların oluştuğunu kontrol edin
SHOW TABLES;

-- Örnek verilerin eklendiğini kontrol edin
SELECT * FROM admin_users;
SELECT * FROM teachers;
```

## ⚙️ Adım 6: Ortam Değişkenlerini Ayarlama

### 6.1 Environment Dosyasını Oluşturma
```bash
# Server dizininde .env dosyasını oluşturun
cd server
cp .env.example .env
```

### 6.2 .env Dosyasını Düzenleme
`server/.env` dosyasını bir metin editörü ile açın ve şu değerleri düzenleyin:

```env
PORT=5000
JWT_SECRET=super_secret_jwt_key_change_this_in_production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password_here
DB_NAME=norm_atama_db
NODE_ENV=development
```

**Önemli**:
- `DB_PASSWORD` kısmına MySQL root şifrenizi yazın
- `JWT_SECRET` için güvenli, uzun bir secret key oluşturun

## 🚀 Adım 7: Uygulamayı Başlatma

### 7.1 Geliştirme Modunda Başlatma
Ana proje dizininde:
```bash
# Hem server hem client'ı aynı anda başlatır
npm run dev
```

Bu komut şunları yapar:
- Backend server'ı `http://localhost:5000` de başlatır
- Frontend client'ı `http://localhost:3000` de başlatır
- Her iki uygulamayı da canlı izler (hot reload)

### 7.2 Ayrı Ayrı Başlatma
```bash
# Sadece server
npm run server

# Sadece client (başka terminal penceresinde)
npm run client
```

## 🌐 Adım 8: Uygulamaya Erişim

### 8.1 Web Tarayıcısı
- Ana uygulama: `http://localhost:3000`
- API health check: `http://localhost:5000/health`

### 8.2 Test Girişleri

**Yönetici Girişi:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

**Öğretmen Girişleri:**
- TC: `12345678901`, Doğum Tarihi: `15.05.1985`
- TC: `12345678902`, Doğum Tarihi: `22.03.1982`
- TC: `12345678903`, Doğum Tarihi: `08.11.1988`

## 🔍 Adım 9: Kurulum Doğrulama

### 9.1 Backend Kontrolü
```bash
# API health check
curl http://localhost:5000/health
```

Başarılı yanıt:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 9.2 Database Kontrolü
```bash
# MySQL'e bağlanın ve test edin
mysql -u root -p norm_atama_db

# Tablolları listeleyin
SHOW TABLES;

# Admin kullanıcısını kontrol edin
SELECT username FROM admin_users;
```

### 9.3 Frontend Kontrolü
- `http://localhost:3000` adresine gidin
- Giriş sayfasının yüklendiğini kontrol edin
- Test hesaplarıyla giriş yapın

## 🚨 Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### 1. "ECONNREFUSED" Database Hatası
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Çözüm:**
- MySQL servisinin çalıştığını kontrol edin
- `.env` dosyasındaki veritabanı bilgilerini kontrol edin

#### 2. "Port 3000 Already in Use"
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Çözüm:**
```bash
# Port'u kullanan process'i bulun
netstat -ano | findstr :3000
# Veya
lsof -i :3000

# Process'i sonlandırın
taskkill /PID <PID> /F
```

#### 3. "JWT Secret Not Defined"
**Çözüm:**
- `server/.env` dosyasında `JWT_SECRET` tanımlandığından emin olun
- Server'ı yeniden başlatın

#### 4. "Cannot Find Module" Hatası
**Çözüm:**
```bash
# Bağımlılıkları yeniden yükleyin
rm -rf node_modules
rm package-lock.json
npm install
```

#### 5. MySQL Bağlantı Hatası
**Çözüm:**
```bash
# MySQL servisini başlatın
# Windows:
net start mysql

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

## 🔒 Güvenlik Notları

### Geliştirme Ortamı
- `.env` dosyasını asla version control'e (git) eklemeyin
- Güçlü şifreler kullanın
- Default şifreleri production'da değiştirin

### Production Önerileri
- `NODE_ENV=production` ayarlayın
- SSL sertifikası kullanın
- Database şifrelerini güçlendirin
- JWT secret'ı güvenli oluşturun

## 📚 Ek Kaynaklar

- [Node.js Dokümantasyonu](https://nodejs.org/docs/)
- [React Dokümantasyonu](https://react.dev/)
- [MySQL Dokümantasyonu](https://dev.mysql.com/doc/)
- [Express.js Dokümantasyonu](https://expressjs.com/)

## 🆘 Yardım Almak

Sorun yaşıyorsanız:
1. Bu rehberi tekrar kontrol edin
2. Console/terminal çıktılarını inceleyin
3. `.env` dosyasını kontrol edin
4. MySQL bağlantısını test edin
5. GitHub Issues sayfasından destek alın

---

**🎉 Kurulum tamamlandı!** Artık uygulamayı kullanmaya başlayabilirsiniz.