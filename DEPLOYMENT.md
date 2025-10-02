# Railway.app Deployment Guide

## Hazırlık Tamamlandı ✅
Projeniz Railway deployment için hazır!

## Adım 1: GitHub Repository Oluşturma

1. GitHub'da yeni repository oluştur: https://github.com/new
2. Repository adı: `norm-atama-sistemi` (veya istediğin bir isim)
3. **Public** veya **Private** seç
4. `.gitignore` ve `README` ekleme (zaten var)

## Adım 2: Kodu GitHub'a Yükle

Komut satırında şu komutları çalıştır:

```bash
git add .
git commit -m "Initial commit - Railway deployment ready"
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
git branch -M main
git push -u origin main
```

## Adım 3: Railway Hesabı Oluşturma

1. https://railway.app adresine git
2. **GitHub ile Sign Up** yap
3. Railway'in GitHub repository'lerine erişmesine izin ver

## Adım 4: MySQL Database Oluşturma

1. Railway Dashboard'da **+ New** → **Database** → **Add MySQL**
2. Database oluşturulduktan sonra **Variables** sekmesinden şu bilgileri not al:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

3. **Data** sekmesine git
4. Query editor'da `server/database/schema.sql` dosyasının içeriğini yapıştır ve çalıştır
5. Tüm tabloların oluştuğunu kontrol et

## Adım 5: Backend Service Deploy Etme

1. Railway Dashboard'da **+ New** → **GitHub Repo**
2. Repository'ni seç: `norm-atama-sistemi`
3. Service oluşturulduktan sonra **Settings** → **Variables** ekle:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=güçlü_bir_secret_key_buraya_yaz
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}
```

4. **Settings** → **Networking** → **Generate Domain** ile public URL oluştur

## Adım 6: Environment Variables'ı Bağlama

Database config dosyasında PORT desteği eklenmiş değil, ekleyelim:

`server/config/database.js` dosyasını şu şekilde güncelle:

```javascript
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,  // Bu satırı ekle
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'norm_atama_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};
```

## Adım 7: Deploy & Test

1. Değişiklikleri push et:
```bash
git add .
git commit -m "Add DB_PORT support for Railway"
git push
```

2. Railway otomatik olarak yeniden deploy edecek
3. Deployment loglarını kontrol et
4. Database bağlantısının başarılı olduğunu doğrula
5. Public URL'i tarayıcıda aç

## Railway ile Ücretsiz Domain

Railway otomatik olarak şu formatta ücretsiz domain sağlar:
- `your-app-name-production.up.railway.app`

## Custom Domain Ekleme (İsteğe Bağlı)

1. Railway Dashboard → Service → **Settings** → **Domains**
2. **Custom Domain** ekle (kendi domain'in varsa)
3. DNS ayarlarını Railway'in gösterdiği gibi yap

## Notlar

### Ücretsiz Plan Limitleri:
- Aylık $5 ücretsiz kredi
- 500 saat execution time
- 100 GB network egress
- Projeyi durdurmak istersen: Dashboard → Service → **Settings** → **Sleep**

### Database Yedekleme:
Railway MySQL'de otomatik backup yok (ücretsiz planda). Periyodik olarak yedek almak için:
```bash
mysqldump -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -p MYSQLDATABASE > backup.sql
```

### Sorun Giderme:
- **Build Failed**: Logs sekmesinden detaylı hata mesajlarını kontrol et
- **Database Connection Error**: Environment variables'ları doğru girdiğini kontrol et
- **500 Error**: Server logs'lara bak (Railway Dashboard → Deployments → View Logs)

## Deployment Sonrası

1. Admin user oluştur (database'de zaten var)
2. Test öğretmenleriyle giriş yap
3. Tüm fonksiyonları test et
4. Production URL'i paylaş!

---

**Railway Dashboard**: https://railway.app/dashboard
**Docs**: https://docs.railway.app/
