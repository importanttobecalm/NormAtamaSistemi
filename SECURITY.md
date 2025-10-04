# Güvenlik Özellikleri

Bu dokümanda Norm Atama Sistemi'nde uygulanan güvenlik önlemleri açıklanmaktadır.

## 🔐 Authentication & Authorization

### Çift Token Sistemi
- **Access Token**: Kısa ömürlü (15 dakika), API istekleri için kullanılır
- **Refresh Token**: Uzun ömürlü (7 gün), access token yenilemek için kullanılır

### Token Özellikleri
- JWT (JSON Web Token) tabanlı
- Her token benzersiz ID içerir
- Token blacklist sistemi (logout için)
- HTTP-only, secure cookies

### Kimlik Doğrulama Seviyeleri
1. **Admin Authentication**: Username + Password
2. **Teacher Authentication**: TC ID + Birth Date
3. **Role-based Access Control**: Admin/Teacher ayrımı

## 🛡️ Network Security

### HTTPS & Cookies
- **HTTP-only cookies**: XSS ataklarına karşı koruma
- **Secure flag**: Sadece HTTPS üzerinden iletim
- **SameSite=Strict**: CSRF ataklarına karşı koruma

### Security Headers (Helmet.js)
```
- Content-Security-Policy: XSS ve injection ataklarına karşı
- HSTS: HTTPS zorlaması (31536000 saniye)
- X-Frame-Options: DENY - Clickjacking koruması
- X-Content-Type-Options: nosniff - MIME sniffing koruması
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
```

### CORS Yapılandırması
- Sadece izin verilen origin'ler
- Credentials desteği
- Production/Development ayrımı

## 🚨 Attack Prevention

### Rate Limiting
- **Genel Limit**: 300 istek / 15 dakika
- **Login Limit**: 20 deneme / 15 dakika
- IP tabanlı izleme
- Başarılı login denemelerini sayma (skip)

### Input Validation & Sanitization
- **express-validator**: Input validation
- **hpp**: HTTP Parameter Pollution koruması
- **Suspicious Activity Detection**:
  - SQL injection pattern detection
  - XSS pattern detection
  - Path traversal detection

### Password Security
- **bcrypt** hashing (10 rounds)
- Plaintext şifre asla saklanmaz
- Login hata mesajları generic (kullanıcı adı/şifre bilgisi verilmez)

### File Upload Security
- **Multer** ile file upload handling
- Dosya boyutu limiti: 10MB
- MIME type validation (sadece Excel: .xls, .xlsx)
- Memory storage (disk'e yazılmıyor)
- Tek seferde 1 dosya yükleme limiti

### Production-Specific Security
- **Setup Endpoints**: Development-only (production'da kapalı)
  - `/api/setup-db/*` sadece development'ta erişilebilir
  - Database initialization endpoint'leri korunuyor
- **Error Details**: Production'da generic mesajlar
  - Server hataları (5xx) detay vermez
  - Sadece client hataları (4xx) spesifik mesaj verir
  - Stack trace production'da gizli

## 📊 Audit & Monitoring

### Audit Logging
Tüm önemli işlemler loglanır:
- Login/Logout işlemleri
- Token yenileme
- Şüpheli aktiviteler
- IP adresi ve User-Agent bilgisi

### Log Formatı
```javascript
{
  timestamp: ISO 8601,
  action: string,
  userId: string,
  userType: 'admin' | 'teacher',
  ip: string,
  userAgent: string,
  path: string,
  method: string
}
```

## 🔑 API Security

### Endpoint Protection
- `/api/admin/*` - Admin-only endpoints (adminAuthMiddleware)
- `/api/teacher/*` - Teacher-only endpoints (teacherAuthMiddleware)
- `/api/auth/*` - Public auth endpoints (rate limited)

### Token Verification
1. Token varlığı kontrolü
2. Token blacklist kontrolü
3. Token geçerlilik kontrolü (JWT verify)
4. Token tipi kontrolü (access/refresh)
5. Kullanıcı varlığı kontrolü (database)

## 🎯 Best Practices

### Production Checklist
- [ ] HTTPS zorunlu (Railway otomatik sağlar)
- [ ] JWT_SECRET ve JWT_REFRESH_SECRET güçlü olmalı (en az 64 karakter)
- [ ] Rate limiting aktif
- [ ] Security headers aktif
- [ ] Audit logging aktif
- [ ] Error messages generic (detay verilmemeli)

### Development vs Production
- **Development**:
  - Secure cookies kapalı (HTTP için)
  - Detaylı error messages
  - Localhost CORS

- **Production**:
  - Secure cookies açık (HTTPS için)
  - Generic error messages
  - Specific domain CORS

## 🔄 Token Lifecycle

### Login Flow
1. Kullanıcı credentials gönderir
2. Credentials doğrulanır (bcrypt)
3. Access + Refresh token oluşturulur
4. Tokenlar HTTP-only cookies olarak set edilir
5. Token bilgileri response'da da döner (backward compatibility)

### Token Refresh Flow
1. Access token süresi doluyor
2. Client refresh token ile `/api/auth/refresh` endpoint'ine istek atar
3. Refresh token doğrulanır
4. Yeni access token oluşturulur
5. Cookie güncellenir

### Logout Flow
1. Client `/api/auth/logout` endpoint'ine istek atar
2. Access token blacklist'e eklenir
3. Refresh token revoke edilir
4. Cookies temizlenir

## 🚫 Known Limitations

### In-Memory Storage
Şu anda token blacklist ve refresh tokenlar memory'de tutulur. Production'da **Redis** kullanılmalı:
- Blacklist için TTL ile otomatik temizleme
- Refresh token storage
- Rate limit storage

### Horizontal Scaling
Multi-instance deployment için Redis gereklidir:
```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

const limiter = rateLimit({
    store: new RedisStore({
        client: client
    }),
    // ...
});
```

## 📝 Security Incident Response

### Şüpheli Aktivite Tespit Edildiğinde
1. Activity loglara kaydedilir
2. Request 400 Bad Request ile reddedilir
3. IP adresi ve pattern bilgisi saklanır
4. [Future] Admin'e bildirim gönderilir

### Token Compromise Durumunda
1. Kullanıcı logout yapmalı (token blacklist'e eklenir)
2. Yeni login yapmalı (yeni tokenlar oluşur)
3. Eski refresh tokenlar geçersiz olur

## 🔍 Security Testing

### Test Edilmesi Gerekenler
- [ ] Login rate limiting
- [ ] Invalid credentials handling
- [ ] Token expiration
- [ ] Token refresh
- [ ] Logout token invalidation
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] CSRF protection
- [ ] CORS policy
- [ ] Security headers

### Test Komutları
```bash
# Rate limiting test
for i in {1..25}; do curl -X POST http://localhost:5000/api/auth/admin/login; done

# XSS test
curl -X POST http://localhost:5000/api/test -d '{"test":"<script>alert(1)</script>"}'

# SQL injection test
curl -X POST http://localhost:5000/api/auth/admin/login -d '{"username":"admin'\'' OR 1=1--"}'
```

## 📚 Dependencies

### Security Packages
- `helmet` - Security headers
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `cookie-parser` - Cookie parsing
- `hpp` - HTTP Parameter Pollution prevention
- `uuid` - Unique token IDs

### Future Additions
- `csurf` - CSRF protection (form-based)
- `express-mongo-sanitize` - NoSQL injection prevention
- `xss-clean` - XSS sanitization
- `rate-limit-redis` - Distributed rate limiting

## 🆘 Security Vulnerability Reporting

Güvenlik açığı bulursanız:
1. **Public disclosure yapmayın** (GitHub Issues kullanmayın)
2. Doğrudan proje sahibine ulaşın: [@importanttobecalm](https://github.com/importanttobecalm)
3. Şu bilgileri sağlayın:
   - Açık detaylı açıklama
   - Reproduction steps (adım adım)
   - Etki analizi (severity assessment)
   - Önerilen çözüm (varsa)

## 📋 Security Checklist Özeti

Production'a deploy etmeden önce:
- ✅ JWT secrets güçlü ve unique
- ✅ Database şifreleri güvenli
- ✅ HTTPS/SSL aktif
- ✅ Default admin şifresi değiştirildi
- ✅ Rate limiting aktif
- ✅ Security headers yapılandırıldı
- ✅ Error messages generic
- ✅ `.env` dosyası git'te yok

Detaylı kontrol listesi için: [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md)

---

**Son Güncelleme:** 4 Ekim 2025
**Güvenlik Versiyonu:** 1.1.1
**Durum:** ✅ Production Ready
