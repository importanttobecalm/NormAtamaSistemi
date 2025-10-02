# 🔒 Güvenlik Kontrol Listesi

## Production Deployment İçin Kritik Güvenlik Adımları

### ✅ Yapılandırma Güvenliği

- [ ] **JWT Secret Değiştirme**
  ```bash
  # Güçlü random secret oluşturun:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

  # Railway/Production environment variables'a ekleyin:
  JWT_SECRET=<generated-secret>
  JWT_REFRESH_SECRET=<another-generated-secret>
  ```

- [ ] **Environment Variables Kontrolü**
  - `NODE_ENV=production` olarak ayarlanmalı
  - Database şifreleri güçlü olmalı
  - `.env` dosyası asla git'e commit edilmemeli

- [ ] **HTTPS Zorunlu**
  - SSL/TLS sertifikası yüklenmiş olmalı
  - HTTP -> HTTPS redirect aktif (kod içinde mevcut)
  - HSTS header aktif (kod içinde mevcut)

### ✅ Kimlik Doğrulama ve Yetkilendirme

- [ ] **Admin Şifre Politikası**
  - Minimum 8 karakter (kod içinde uygulanmış)
  - En az 1 büyük harf, 1 küçük harf, 1 rakam (kod içinde uygulanmış)
  - İlk kurulumda varsayılan admin şifresini değiştir!

- [ ] **Token Güvenliği**
  - Access token süresi: 15 dakika (kod içinde mevcut)
  - Refresh token süresi: 7 gün (kod içinde mevcut)
  - HTTP-only cookies kullanımda (kod içinde mevcut)
  - SameSite=strict ayarı aktif (kod içinde mevcut)

- [ ] **Session Management**
  - Logout sonrası token blacklist (kod içinde mevcut)
  - Concurrent session kontrolü (opsiyonel)

### ✅ Veri Güvenliği

- [ ] **Database**
  - Connection pooling aktif (kod içinde mevcut)
  - Parametreli sorgular kullanımda (kod içinde mevcut)
  - UTF-8 encoding ayarlanmış (kod içinde mevcut)
  - Regular backup stratejisi kurulmalı

- [ ] **Input Validation**
  - express-validator kullanımda (kod içinde mevcut)
  - TC kimlik no formatı kontrol ediliyor (kod içinde mevcut)
  - SQL injection koruması (kod içinde mevcut)
  - XSS koruması aktif (kod içinde mevcut)

- [ ] **Şifre Güvenliği**
  - bcrypt hashing (10 rounds) kullanımda (kod içinde mevcut)
  - Şifreler hiçbir zaman plain text saklanmıyor

### ✅ Network Güvenliği

- [ ] **Rate Limiting**
  - Genel API: 300 req/15min (kod içinde mevcut)
  - Login endpoints: 20 req/15min (kod içinde mevcut)
  - Production'da Redis tabanlı rate limiting düşünülebilir

- [ ] **CORS**
  - Sadece güvenilir origin'lere izin (kod içinde mevcut)
  - Credentials support aktif (kod içinde mevcut)

- [ ] **Headers**
  - Helmet middleware aktif (kod içinde mevcut)
  - CSP (Content Security Policy) yapılandırılmış (kod içinde mevcut)
  - X-Frame-Options: DENY (kod içinde mevcut)
  - X-Content-Type-Options: nosniff (kod içinde mevcut)

### ✅ Uygulama Güvenliği

- [ ] **Error Handling**
  - Production'da stack trace'ler gizlenmeli (kod içinde mevcut)
  - Generic error messages kullanılmalı (kod içinde mevcut)
  - Detaylı hatalar sadece log'lara yazılmalı

- [ ] **Logging & Monitoring**
  - Suspicious activity detection aktif (kod içinde mevcut)
  - Login attempts log'lanıyor (kod içinde mevcut)
  - Production'da merkezi logging sistemi kurulmalı (Winston, Morgan, etc.)

- [ ] **File Upload** (gelecek özellik)
  - File type validation
  - File size limits
  - Virus scanning
  - Separate storage location

### ✅ Kod Güvenliği

- [ ] **Dependencies**
  ```bash
  # Güvenlik açıkları kontrol edin:
  npm audit
  npm audit fix

  # Outdated packages kontrolü:
  npm outdated
  ```

- [ ] **Secrets Detection**
  - `.env` dosyası git'te yok (kontrol edildi)
  - API keys, passwords kod içinde hardcoded değil
  - `.gitignore` doğru yapılandırılmış

### ✅ Database Şeması Güvenliği

- [ ] **Tablolar**
  - Foreign key constraints mevcut
  - Indexler performans için ayarlanmış
  - Cascade delete'ler doğru yapılandırılmış

- [ ] **Kullanıcı İzinleri**
  - Database user'ın minimum yetkileri olmalı
  - Production'da root user kullanılmamalı

### ✅ Deployment Güvenliği

- [ ] **Railway/Cloud Platform**
  - Environment variables platform üzerinden ayarlanmalı
  - Database şifreleri rotate edilmeli
  - SSL/TLS certificates up-to-date olmalı

- [ ] **Docker (Varsa)**
  - Base image güvenilir kaynaktan
  - Multi-stage build kullanımı (kod içinde mevcut)
  - Non-root user ile çalışmalı

### ✅ Sürekli Güvenlik

- [ ] **Regular Updates**
  - Haftalık `npm audit` kontrolü
  - Aylık dependency güncellemesi
  - Security patch'leri hemen uygulama

- [ ] **Penetration Testing**
  - Production öncesi güvenlik testi
  - OWASP Top 10 kontrolü
  - Vulnerability scanning

- [ ] **Backup & Recovery**
  - Günlük database backup
  - Backup restore testi (monthly)
  - Disaster recovery planı

## 🚨 Kritik Hatırlatmalar

### ❌ ASLA YAPMAYIN:

1. `.env` dosyasını git'e commit etmeyin
2. Production'da default şifreler kullanmayın
3. API keys'leri frontend kodunda saklamayın
4. Error messages'da sensitive data döndürmeyin
5. HTTP üzerinden sensitive data göndermeyin
6. Database şifrelerini code içinde hardcode etmeyin

### ✅ MUTLAKA YAPIN:

1. Production'da `NODE_ENV=production` kullanın
2. JWT secrets'ı production için değiştirin
3. HTTPS zorunlu olmalı
4. Regular security audit yapın
5. Error logging'i aktif tutun
6. Rate limiting'i etkin tutun

## 📋 İlk Deployment Kontrol Listesi

1. [ ] `.env` dosyasında tüm secrets değiştirildi mi?
2. [ ] Admin default şifresi değiştirildi mi?
3. [ ] HTTPS aktif mi?
4. [ ] Database backup stratejisi kuruldu mu?
5. [ ] Error logging aktif mi?
6. [ ] Rate limiting test edildi mi?
7. [ ] CORS ayarları production domain'i içeriyor mu?
8. [ ] SSL sertifikası geçerli mi?
9. [ ] Database connection pooling çalışıyor mu?
10. [ ] Token refresh mekanizması test edildi mi?

## 🔍 Güvenlik Testi

### Manual Test Checklist:

```bash
# 1. SQL Injection Testi
# Login endpoint'e şu payloads'ları gönderin:
' OR '1'='1
admin'--
' UNION SELECT NULL--

# 2. XSS Testi
# Input field'lara şu payloads'ları girin:
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>

# 3. Rate Limiting Testi
# 20'den fazla login denemesi yapın (block edilmeli)
for i in {1..25}; do curl -X POST http://localhost:5000/api/auth/admin/login -d '{"username":"test","password":"test"}'; done

# 4. HTTPS Redirect Testi (Production)
curl -I http://your-domain.com
# Response: 301/302 redirect to https://

# 5. Token Expiry Testi
# 15 dakika sonra expired token ile istek yapın (401 dönmeli)
```

## 📞 Güvenlik İhlali Durumunda

1. Tüm aktif session'ları sonlandırın
2. Şifreleri reset edin
3. Log'ları inceleyin
4. Affected users'a bildirim gönderin
5. Security patch uygulayın
6. Post-mortem raporu yazın

---

**Son Güncelleme:** 2 Ekim 2025
**Sürüm:** 1.0
**Durum:** ✅ Production Ready (checklist tamamlandıktan sonra)
