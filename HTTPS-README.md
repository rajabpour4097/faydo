# 🔒 HTTPS Setup for Faydo Project

## راه‌اندازی HTTPS برای پروژه Faydo

این راهنما برای دسترسی به دوربین و GPS گوشی در محیط توسعه لوکال است.

---

## 📋 پیش‌نیازها

### نصب شده:
- ✅ Nginx
- ✅ SSL Certificate (خودامضا)
- ✅ کانفیگ Nginx

### مسیرها:
- **SSL Certificate**: `/etc/nginx/ssl/localhost.crt`
- **SSL Key**: `/etc/nginx/ssl/localhost.key`
- **Nginx Config**: `/etc/nginx/sites-available/faydo-https`

---

## 🚀 نحوه اجرا

### روش 1: استفاده از اسکریپت (توصیه می‌شود)

```bash
# راه‌اندازی پروژه
./start-https.sh

# توقف پروژه
./stop-https.sh
```

### روش 2: اجرای دستی

```bash
# 1. اطمینان از اجرای Nginx
sudo systemctl start nginx

# 2. راه‌اندازی Backend (Django)
cd backend
python3 manage.py runserver 8001

# 3. راه‌اندازی Frontend (Vite) - در ترمینال جدید
cd frontend
npm run dev
```

---

## 🌐 آدرس‌های دسترسی

| سرویس | آدرس |
|-------|------|
| **Frontend** | https://localhost |
| **Backend API** | https://localhost/api |
| **Django Admin** | https://localhost/admin |

---

## ⚠️ هشدار امنیتی مرورگر

هنگام باز کردن `https://localhost` در مرورگر، پیام امنیتی خواهید دید:

### Chrome/Edge:
1. روی "Advanced" کلیک کنید
2. روی "Proceed to localhost (unsafe)" کلیک کنید

### Firefox:
1. روی "Advanced" کلیک کنید
2. روی "Accept the Risk and Continue" کلیک کنید

این عادی است چون از گواهی خودامضا استفاده می‌کنیم.

---

## 📱 دسترسی به دوربین و GPS

حالا می‌توانید در پروژه خود از API های زیر استفاده کنید:

### دوربین:
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
```

### موقعیت مکانی:
```javascript
navigator.geolocation.getCurrentPosition()
```

---

## 🔧 عیب‌یابی

### مشکل: Nginx اجرا نمی‌شود

```bash
# بررسی وضعیت
sudo systemctl status nginx

# تست کانفیگ
sudo nginx -t

# مشاهده لاگ‌ها
sudo tail -f /var/log/nginx/faydo-error.log
```

### مشکل: پورت 8001 یا 5173 اشغال است

```bash
# پیدا کردن و kill کردن پروسه
sudo lsof -ti:8001 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### مشکل: دسترسی به دوربین کار نمی‌کند

1. اطمینان حاصل کنید که از `https://localhost` استفاده می‌کنید (نه `http://`)
2. در تنظیمات مرورگر، دسترسی به دوربین را برای localhost فعال کنید
3. کش مرورگر را پاک کنید

---

## 📝 توضیحات فنی

### ساختار Nginx:

```
HTTP (port 80) → Redirect به HTTPS
HTTPS (port 443) → 
  ├─ / → Vite Dev Server (port 5173)
  ├─ /api → Django Backend (port 8001)
  ├─ /admin → Django Admin
  ├─ /static → Django Static Files
  └─ /media → Django Media Files
```

### فایل‌های مهم:

- `nginx-https.conf` - کانفیگ Nginx
- `start-https.sh` - اسکریپت راه‌اندازی
- `stop-https.sh` - اسکریپت توقف
- `frontend/vite.config.ts` - تنظیمات Vite
- `frontend/.env.local` - متغیرهای محیطی

---

## 🔄 به‌روزرسانی کانفیگ

اگر تغییری در کانفیگ Nginx دادید:

```bash
# کپی کانفیگ جدید
sudo cp nginx-https.conf /etc/nginx/sites-available/faydo-https

# تست کانفیگ
sudo nginx -t

# راه‌اندازی مجدد
sudo systemctl reload nginx
```

---

## 📞 پشتیبانی

در صورت بروز مشکل، لاگ‌های زیر را بررسی کنید:

```bash
# Nginx errors
sudo tail -f /var/log/nginx/faydo-error.log

# Nginx access
sudo tail -f /var/log/nginx/faydo-access.log

# Django
tail -f /tmp/django.log

# Vite
tail -f /tmp/vite.log
```

---

## ✅ چک‌لیست نهایی

- [ ] Nginx اجرا است: `sudo systemctl status nginx`
- [ ] Django روی پورت 8001 اجرا است: `curl http://localhost:8001`
- [ ] Vite روی پورت 5173 اجرا است: `curl http://localhost:5173`
- [ ] HTTPS کار می‌کند: باز کردن `https://localhost` در مرورگر
- [ ] دوربین دسترسی دارد: تست در کنسول مرورگر
- [ ] GPS کار می‌کند: تست در کنسول مرورگر

---

Made with ❤️ for Faydo Project
