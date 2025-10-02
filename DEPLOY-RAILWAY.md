# Railway'e Deploy Etme Rehberi

## 1. Yöntem: Railway CLI ile Deploy

### Adım 1: Yeni servis oluştur
```bash
railway up
```

Bu komut:
- Mevcut dizini Railway'e yükler
- Otomatik olarak build ve deploy başlatır
- Size bir URL verir

### Adım 2: Environment variables ayarla
```bash
railway variables set DB_HOST=crossover.proxy.rlwy.net
railway variables set DB_USER=root
railway variables set DB_PASSWORD=MtywNwQvMMWDFfnGLZDwKQwDaatEmccz
railway variables set DB_NAME=railway
railway variables set DB_PORT=22237
railway variables set JWT_SECRET=your_super_secret_jwt_key_here
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

### Adım 3: Railway domain'i al
```bash
railway domain
```

Bu komut size bir Railway domain verecek (örn: `your-app.up.railway.app`)

### Adım 4: Custom domain ekle (opsiyonel)
Railway dashboard'dan:
1. Projenize gidin
2. Settings > Domains
3. "Add Domain" butonuna tıklayın
4. Kendi domain'inizi ekleyin
5. DNS ayarlarını yapın (Railway size CNAME kaydı verecek)

---

## 2. Yöntem: GitHub üzerinden Deploy

### Adım 1: GitHub repository oluştur
```bash
# GitHub'da yeni bir repository oluşturun
# Örnek: https://github.com/yourusername/norm-atama-sistemi
```

### Adım 2: Remote ekle ve push et
```bash
git remote add origin https://github.com/yourusername/norm-atama-sistemi.git
git push -u origin master
```

### Adım 3: Railway'de GitHub'dan deploy et
1. Railway dashboard'a git (https://railway.app)
2. "New Project" > "Deploy from GitHub repo"
3. Repository'nizi seçin
4. Root path: `/` (default)
5. "Deploy Now"

### Adım 4: Environment variables ekle
Railway dashboard'dan:
1. Projenize gidin
2. Variables sekmesine gidin
3. Yukarıdaki environment variable'ları ekleyin

---

## Mevcut Durum

✅ Git repository oluşturuldu (local)
✅ Railway MySQL database hazır
✅ Environment variables yapılandırıldı
✅ Production build configuration hazır

## Sonraki Adımlar

### Hızlı Deploy (Railway CLI):
```bash
railway up
```

### Domain Alma:
```bash
railway domain
```

### Logs İzleme:
```bash
railway logs
```

### Servis URL'ini Görme:
```bash
railway status
```

---

## Önemli Notlar

1. **CORS Ayarı**: `server/index.js` dosyasında CORS origin'i production domain'inizi ekleyin
2. **Build Süresi**: İlk build 5-10 dakika sürebilir
3. **Database Bağlantısı**: MySQL'in internal URL'si Railway içinde otomatik çalışır
4. **Port**: Railway otomatik olarak `PORT` environment variable'ı atar (genellikle 3000)

## Troubleshooting

### Build hatası alırsanız:
```bash
railway logs
```

### Database bağlantı hatası:
- Environment variables'ları kontrol edin
- Railway MySQL service'inin aktif olduğundan emin olun

### Domain çalışmıyorsa:
- DNS propagation için 24 saat bekleyin
- Railway domain'ini test edin
