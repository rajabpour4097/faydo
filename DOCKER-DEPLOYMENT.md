# 🚀 راهنمای استقرار Faydo با Docker

این راهنما نحوه راه‌اندازی پروژه Faydo روی یک سرور شخصی با Docker و HTTPS را توضیح می‌دهد.

## 📋 پیش‌نیازها

قبل از شروع، مطمئن شوید که موارد زیر روی سرور نصب شده‌اند:

### 1. نصب Docker

```bash
# برای Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# اضافه کردن کاربر به گروه docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. نصب Docker Compose (اگر نصب نیست)

```bash
# Docker Compose معمولاً با Docker نصب می‌شود
# برای بررسی:
docker compose version

# یا اگر نسخه قدیمی دارید:
sudo apt install docker-compose-plugin
```

### 3. نصب OpenSSL (برای تولید گواهی SSL)

```bash
sudo apt install openssl
```

## 🔧 مراحل راه‌اندازی

### روش ۱: استفاده از اسکریپت خودکار (پیشنهادی)

```bash
# 1. انتقال پروژه به سرور (با scp یا git)
scp -r ./faydo user@your-server:/home/user/

# 2. اتصال به سرور
ssh user@your-server

# 3. رفتن به پوشه پروژه
cd /home/user/faydo

# 4. اجازه اجرا به اسکریپت
chmod +x docker-setup.sh docker-control.sh

# 5. اجرای اسکریپت راه‌اندازی
./docker-setup.sh
```

### روش ۲: راه‌اندازی دستی

```bash
# 1. ایجاد پوشه SSL
mkdir -p docker/nginx/ssl

# 2. تولید گواهی SSL (جایگزین YOUR_SERVER_IP با IP سرور)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/nginx/ssl/key.pem \
    -out docker/nginx/ssl/cert.pem \
    -subj "/C=IR/ST=Tehran/L=Tehran/O=Faydo/CN=YOUR_SERVER_IP"

# 3. ایجاد فایل .env
cp .env.example .env
# ویرایش فایل .env و تنظیم SECRET_KEY امن

# 4. ساخت و راه‌اندازی
docker compose build
docker compose up -d

# 5. اجرای migrations
docker exec -it faydo-backend python manage.py migrate

# 6. ایجاد کاربر ادمین
docker exec -it faydo-backend python manage.py createsuperuser
```

## 🌐 دسترسی به برنامه

پس از راه‌اندازی:

| سرویس | آدرس |
|-------|------|
| **برنامه اصلی (HTTPS)** | `https://YOUR_SERVER_IP:9000` |
| **HTTP (redirect)** | `http://YOUR_SERVER_IP:9080` |
| **پنل ادمین** | `https://YOUR_SERVER_IP:9000/admin/` |
| **API** | `https://YOUR_SERVER_IP:9000/api/` |

> ⚠️ **توجه:** چون از گواهی self-signed استفاده می‌کنیم، مرورگر هشدار امنیتی نمایش می‌دهد. روی "Advanced" و سپس "Proceed" کلیک کنید.

## 🔒 HTTPS و دسترسی به دوربین

برای دسترسی به دوربین و سایر امکانات مرورگر که نیاز به Secure Context دارند، **حتماً باید از HTTPS استفاده کنید**.

### تولید گواهی معتبر (پیشنهادی برای production)

اگر دامنه دارید، از Let's Encrypt استفاده کنید:

```bash
# نصب Certbot
sudo apt install certbot

# دریافت گواهی
sudo certbot certonly --standalone -d your-domain.com

# کپی گواهی‌ها به پوشه پروژه
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem

# ری‌استارت nginx
docker compose restart nginx
```

## 🛠 دستورات مدیریتی

با استفاده از `docker-control.sh`:

```bash
# شروع سرویس‌ها
./docker-control.sh start

# توقف سرویس‌ها
./docker-control.sh stop

# ری‌استارت
./docker-control.sh restart

# مشاهده لاگ‌ها
./docker-control.sh logs

# وضعیت سرویس‌ها
./docker-control.sh status

# اجرای migrations
./docker-control.sh migrate

# ایجاد superuser
./docker-control.sh createsuperuser

# بکاپ دیتابیس
./docker-control.sh backup

# بازسازی کامل
./docker-control.sh rebuild
```

## 📁 ساختار فایل‌های Docker

```
faydo/
├── docker-compose.yml          # تنظیمات Docker Compose
├── docker-setup.sh             # اسکریپت راه‌اندازی
├── docker-control.sh           # اسکریپت مدیریت
├── .env                        # متغیرهای محیطی
├── .env.example                # نمونه فایل env
├── .dockerignore               # فایل‌های ignore شده
├── backend/
│   └── Dockerfile              # Dockerfile بک‌اند
├── frontend/
│   ├── Dockerfile              # Dockerfile فرانت‌اند
│   └── nginx.conf              # تنظیمات nginx فرانت‌اند
└── docker/
    └── nginx/
        ├── nginx.conf          # تنظیمات nginx اصلی
        └── ssl/
            ├── cert.pem        # گواهی SSL
            └── key.pem         # کلید خصوصی
```

## 🔧 تغییر پورت

برای تغییر پورت از ۹۰۰۰ به پورت دیگر:

1. فایل `docker-compose.yml` را ویرایش کنید:
```yaml
nginx:
  ports:
    - "NEW_PORT:443"    # جایگزین 9000 با پورت جدید
    - "NEW_HTTP_PORT:80"
```

2. ری‌استارت کنید:
```bash
docker compose down
docker compose up -d
```

## 🐛 عیب‌یابی

### مشکل: سرویس‌ها بالا نمی‌آیند

```bash
# مشاهده لاگ‌ها
docker compose logs

# بررسی وضعیت
docker compose ps

# بررسی پورت‌ها
sudo netstat -tlnp | grep -E '9000|9080'
```

### مشکل: خطای SSL

```bash
# بررسی فایل‌های SSL
ls -la docker/nginx/ssl/

# تولید مجدد گواهی
rm docker/nginx/ssl/*
./docker-setup.sh
```

### مشکل: دیتابیس

```bash
# بررسی دسترسی به دیتابیس
ls -la backend/db.sqlite3

# تنظیم مجوز
chmod 666 backend/db.sqlite3
```

### مشکل: دسترسی به دوربین

1. حتماً از HTTPS استفاده کنید
2. در مرورگر، گواهی را Accept کنید
3. دسترسی دوربین را در تنظیمات مرورگر فعال کنید

## 🔄 به‌روزرسانی

برای به‌روزرسانی پروژه:

```bash
# 1. دریافت آخرین تغییرات
git pull origin main

# 2. بازسازی و راه‌اندازی مجدد
./docker-control.sh rebuild

# 3. اجرای migrations جدید
./docker-control.sh migrate
```

## 📊 مانیتورینگ

```bash
# مشاهده مصرف منابع
docker stats

# مشاهده لاگ‌های زنده
docker compose logs -f

# لاگ یک سرویس خاص
docker compose logs -f backend
```

## 🔐 امنیت

### توصیه‌های امنیتی:

1. **SECRET_KEY قوی**: حتماً یک کلید امن و تصادفی استفاده کنید
2. **DEBUG=False**: در production حتماً غیرفعال باشد
3. **Firewall**: فقط پورت‌های مورد نیاز را باز کنید:
   ```bash
   sudo ufw allow 9000/tcp
   sudo ufw enable
   ```
4. **گواهی معتبر**: برای production از Let's Encrypt استفاده کنید
5. **بکاپ منظم**: دیتابیس را منظم بکاپ بگیرید

## 📞 پشتیبانی

در صورت مشکل:
1. لاگ‌ها را بررسی کنید: `./docker-control.sh logs`
2. Issue بزنید در مخزن GitHub
