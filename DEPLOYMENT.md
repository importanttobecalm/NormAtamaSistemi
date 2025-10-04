# Deployment Rehberi

Bu rehber, projeyi Railway platformuna deploy etme adımlarını açıklamaktadır.

## Gereksinimler

- [Railway CLI](https://docs.railway.app/develop/cli) veya Railway Dashboard erişimi
- GitHub hesabı (GitHub üzerinden deploy için)
- Proje dosyalarının hazır olması

## 1. Yöntem: Railway CLI ile Deploy

### Adım 1: Railway CLI Kurulumu

```bash
# NPM ile
npm install -g @railway/cli

# Brew ile (macOS)
brew install railway

# Windows (scoop)
scoop install railway
```

### Adım 2: Railway'e Giriş Yapma

```bash
railway login
```

### Adım 3: Proje Oluşturma ve Deploy

```bash
# Proje dizininde
railway init

# Deploy et
railway up
```

### Adım 4: Environment Variables Ayarlama

Railway Dashboard'dan veya CLI ile environment variables ekleyin:

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<güvenli-random-secret>
railway variables set JWT_REFRESH_SECRET=<güvenli-random-secret>
railway variables set PORT=5000
```

**Güvenli secret oluşturmak için:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Adım 5: MySQL Database Ekleme

Railway Dashboard'dan:
1. **New** → **Database** → **Add MySQL**
2. Database oluşturulduktan sonra otomatik olarak environment variables eklenir:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### Adım 6: Database Schema Import

Railway Dashboard → MySQL → **Data** sekmesinden:
1. Query editor'ı açın
2. `server/database/schema.sql` dosyasının içeriğini kopyalayın
3. Query editor'a yapıştırıp çalıştırın
4. `server/database/assignments_table.sql` için de aynısını yapın

### Adım 7: Domain Oluşturma

```bash
# Railway domain oluştur
railway domain
```

Bu size otomatik olarak `*.up.railway.app` formatında bir domain verecektir.

---

## 2. Yöntem: GitHub üzerinden Deploy

### Adım 1: GitHub Repository Oluşturma

1. GitHub'da yeni repository oluşturun
2. Repository'yi public veya private olarak ayarlayın

### Adım 2: Kodu GitHub'a Push Etme

```bash
git remote add origin https://github.com/username/repo-name.git
git branch -M master
git push -u origin master
```

### Adım 3: Railway'de GitHub Deploy

1. [Railway Dashboard](https://railway.app)'a gidin
2. **New Project** → **Deploy from GitHub repo**
3. Repository'nizi seçin
4. Railway otomatik olarak build ve deploy işlemini başlatacaktır

### Adım 4: Environment Variables Ekleme

Railway Dashboard'da:
1. Projenize tıklayın
2. **Variables** sekmesine gidin
3. Aşağıdaki değişkenleri ekleyin:

```
NODE_ENV=production
JWT_SECRET=<güvenli-secret>
JWT_REFRESH_SECRET=<güvenli-secret>
PORT=5000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}
```

**Not:** `${{MySQL.*}}` formatı Railway'in otomatik variable reference sistemidir.

---

## 3. Custom Domain Ekleme (Opsiyonel)

Railway Dashboard'dan:
1. Projenize gidin
2. **Settings** → **Domains**
3. **Custom Domain** ekleyin
4. DNS sağlayıcınızda Railway'in belirttiği CNAME kaydını oluşturun
5. DNS propagation için 24 saat bekleyin

---

## 4. CORS Ayarları

Production domain'inizi `server/index.js` dosyasındaki CORS ayarlarına ekleyin:

```javascript
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://your-app.up.railway.app',
        'https://your-custom-domain.com'
    ],
    credentials: true
};
```

---

## 5. Monitoring ve Logs

### Logs İzleme

```bash
# CLI ile
railway logs

# veya Railway Dashboard → Deployments → View Logs
```

### Deploy Status

```bash
railway status
```

### Environment Variables Kontrol

```bash
railway variables
```

---

## 6. Troubleshooting

### Build Hatası

```bash
# Detaylı logları kontrol edin
railway logs

# Local'de build test edin
npm run build
```

### Database Connection Error

1. Environment variables'ları kontrol edin
2. MySQL service'inin aktif olduğunu doğrulayın
3. Database credentials'ları Railway MySQL variables ile eşleştirin

### 500 Server Error

1. Railway logs'u kontrol edin
2. Environment variables eksik mi kontrol edin
3. Database migration'ların tamamlandığını doğrulayın

### Port Issues

Railway otomatik olarak `PORT` environment variable atar. `server/index.js` dosyasında:

```javascript
const PORT = process.env.PORT || 5000;
```

---

## 7. Production Checklist

Deploy öncesi kontrol listesi:

- [ ] Tüm environment variables ayarlandı mı?
- [ ] JWT secrets güçlü ve unique mi?
- [ ] Database schema import edildi mi?
- [ ] CORS production domain'leri eklendi mi?
- [ ] `.env` dosyası `.gitignore`'da mı?
- [ ] Hassas bilgiler repository'de yok mu?
- [ ] Admin default şifresi değiştirildi mi?
- [ ] Production build test edildi mi?

---

## 8. Deployment Sonrası

1. **Health Check:** `https://your-app.up.railway.app/health`
2. **Admin Login:** Default admin şifresini değiştirin
3. **Test:** Tüm özellikleri test edin
4. **Monitor:** İlk 24 saat logları takip edin

---

## Faydalı Linkler

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Railway Dashboard](https://railway.app/dashboard)

---

## Ücretsiz Plan Limitleri

Railway ücretsiz planında:
- **Execution Time:** 500 saat/ay
- **Network Egress:** 100GB/ay
- **Database:** 1GB storage

Limitler hakkında detaylı bilgi: [Railway Pricing](https://railway.app/pricing)

---

**Son Güncelleme:** 4 Ekim 2025
