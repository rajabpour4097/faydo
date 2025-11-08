# 🚀 راه‌اندازی Faydo روی VPS - 65.109.184.222

این فایل، دستورالعمل کامل نصب و راه‌اندازی پروژه Faydo روی سرور شما است.

---

## مشخصات سرور
- **IP:** 65.109.184.222
- **OS:** Ubuntu 22.04 LTS (فرض)
- **Django Port:** 8001 (داخلی)
- **Nginx:** Reverse proxy روی پورت 80/443

---

## گام 1: اتصال به سرور و آماده‌سازی

```bash
# اتصال SSH
ssh root@65.109.184.222

# آپدیت سیستم
apt update && apt upgrade -y

# نصب پکیج‌های اولیه
apt install -y python3 python3-pip python3-venv git curl nginx ufw

# تنظیم timezone (اختیاری)
timedatectl set-timezone Asia/Tehran
```

---

## گام 2: فایروال (UFW)

```bash
# اجازه SSH، HTTP، HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp

# فعال‌سازی فایروال
ufw --force enable
ufw status
```

---

## گام 3: کلون پروژه

```bash
# ساخت دایرکتوری
mkdir -p /var/www/faydo
cd /var/www/faydo

# کلون مخزن
git clone https://github.com/rajabpour4097/faydo.git .

# یا اگر از SSH استفاده می‌کنید:
# git clone git@github.com:rajabpour4097/faydo.git .
```

---

## گام 4: نصب Backend (Django)

```bash
cd /var/www/faydo

# ساخت virtual environment
python3 -m venv venv
source venv/bin/activate

# نصب requirements
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install gunicorn

# تنظیمات Django
cd backend
```

**ویرایش `backend/core/settings.py`:**
```python
DEBUG = False
ALLOWED_HOSTS = ['65.109.184.222', 'localhost', '127.0.0.1']
CSRF_TRUSTED_ORIGINS = ['http://65.109.184.222', 'https://65.109.184.222']

# اگر SECRET_KEY ندارید، یکی بسازید:
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

```bash
# Migrate و collectstatic
python manage.py migrate
python manage.py collectstatic --noinput

# ساخت superuser (اختیاری)
python manage.py createsuperuser
```

---

## گام 5: Gunicorn Service

**ساخت فایل سرویس:**
```bash
nano /etc/systemd/system/faydo-backend.service
```

**محتوای فایل:**
```ini
[Unit]
Description=Faydo Django Backend
After=network.target

[Service]
Type=notify
User=root
Group=www-data
WorkingDirectory=/var/www/faydo/backend
Environment="DJANGO_SETTINGS_MODULE=core.settings"
ExecStart=/var/www/faydo/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8001 \
    --access-logfile /var/log/faydo-access.log \
    --error-logfile /var/log/faydo-error.log \
    core.wsgi:application
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**راه‌اندازی سرویس:**
```bash
systemctl daemon-reload
systemctl enable faydo-backend
systemctl start faydo-backend
systemctl status faydo-backend

# تست Django
curl -I http://127.0.0.1:8001/api/accounts/users/
```

---

## گام 6: Frontend Build

```bash
# نصب Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

# Build Frontend
cd /var/www/faydo/frontend
npm install
npm run build

# خروجی در: /var/www/faydo/frontend/dist
```

---

## گام 7: Nginx Configuration

**ساخت فایل کانفیگ:**
```bash
nano /etc/nginx/sites-available/faydo
```

**محتوای فایل (HTTP فقط - بدون SSL):**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 65.109.184.222;

    # Frontend Static Files
    root /var/www/faydo/frontend/dist;
    index index.html;

    # Logging
    access_log /var/log/nginx/faydo-access.log;
    error_log /var/log/nginx/faydo-error.log;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Django
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media Files
    location /media/ {
        alias /var/www/faydo/backend/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Static Files (Django)
    location /static/ {
        alias /var/www/faydo/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

**فعال‌سازی سایت:**
```bash
# لینک به sites-enabled
ln -s /etc/nginx/sites-available/faydo /etc/nginx/sites-enabled/

# حذف default site (اختیاری)
rm -f /etc/nginx/sites-enabled/default

# تست و reload
nginx -t
systemctl reload nginx
```

---

## گام 8: مجوزها و دسترسی‌ها

```bash
# مالکیت فایل‌ها
chown -R www-data:www-data /var/www/faydo/backend/media
chown -R www-data:www-data /var/www/faydo/backend/staticfiles

# دسترسی خواندن به frontend/dist
chmod -R 755 /var/www/faydo/frontend/dist
```

---

## گام 9: SSL با Let's Encrypt (اختیاری - اگر دامنه دارید)

اگر دامنه دارید و به IP خود point کرده‌اید:

```bash
# نصب Certbot
snap install core
snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# دریافت SSL (جایگزین example.com با دامنه خود)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# تست تمدید خودکار
certbot renew --dry-run
```

**نکته:** اگر فقط IP دارید و دامنه ندارید، HTTP کافی است یا می‌توانید self-signed SSL بسازید.

---

## گام 10: تست نهایی

**از مرورگر یا curl:**
```bash
# تست Frontend
curl -I http://65.109.184.222

# تست API
curl -I http://65.109.184.222/api/accounts/users/

# تست Admin
curl -I http://65.109.184.222/admin/
```

**از مرورگر:**
- Frontend: `http://65.109.184.222`
- API: `http://65.109.184.222/api/accounts/users/`
- Admin: `http://65.109.184.222/admin/`

---

## نکات مهم

### 1. لاگ‌ها
```bash
# Django logs
journalctl -u faydo-backend -f

# Nginx logs
tail -f /var/log/nginx/faydo-access.log
tail -f /var/log/nginx/faydo-error.log

# Gunicorn logs
tail -f /var/log/faydo-access.log
tail -f /var/log/faydo-error.log
```

### 2. Restart سرویس‌ها
```bash
# Django
systemctl restart faydo-backend

# Nginx
systemctl reload nginx
```

### 3. آپدیت کد
```bash
cd /var/www/faydo

# Pull تغییرات جدید
git pull origin main

# Restart Backend
systemctl restart faydo-backend

# اگر Frontend تغییر کرده:
cd frontend
npm install
npm run build
systemctl reload nginx
```

### 4. Database Backup (توصیه می‌شود)
```bash
# Backup SQLite
cp /var/www/faydo/backend/db.sqlite3 /var/backups/db.sqlite3.$(date +%F)

# یا برای PostgreSQL/MySQL از pg_dump/mysqldump استفاده کنید
```

---

## Troubleshooting

### مشکل 1: Django start نمی‌شود
```bash
# چک کردن status
systemctl status faydo-backend

# دیدن خطاها
journalctl -u faydo-backend -n 50
```

### مشکل 2: Nginx 502 Bad Gateway
```bash
# چک کنید Django روی 8001 در حال اجراست
curl -I http://127.0.0.1:8001/api/accounts/users/

# چک کنید فایروال پورت 8001 را block نکرده
# (نباید چون داخلی است)
```

### مشکل 3: Static files نمایش داده نمی‌شود
```bash
# مجدداً collectstatic
cd /var/www/faydo/backend
source ../venv/bin/activate
python manage.py collectstatic --noinput

# چک مجوزها
ls -la /var/www/faydo/backend/staticfiles/
```

---

## Checklist نهایی

- [ ] سرور آپدیت شد (`apt update && apt upgrade`)
- [ ] فایروال تنظیم شد (UFW با پورت 80، 443، SSH)
- [ ] پروژه کلون شد در `/var/www/faydo`
- [ ] Virtual environment ساخته شد و requirements نصب شد
- [ ] Gunicorn نصب شد
- [ ] `settings.py` ویرایش شد (DEBUG=False، ALLOWED_HOSTS، CSRF)
- [ ] Migrate و collectstatic اجرا شد
- [ ] Gunicorn service ساخته و enable شد
- [ ] Django روی 127.0.0.1:8001 پاسخ می‌دهد
- [ ] Node.js نصب شد و Frontend build شد
- [ ] Nginx config ساخته و enable شد
- [ ] Nginx config تست شد (`nginx -t`)
- [ ] مجوز فایل‌ها تنظیم شد
- [ ] از مرورگر سایت باز می‌شود: `http://65.109.184.222`
- [ ] API کار می‌کند: `http://65.109.184.222/api/`
- [ ] Admin کار می‌کند: `http://65.109.184.222/admin/`

---

## موفق باشید! 🎉

اگر سؤالی دارید یا مشکلی پیش آمد، لاگ‌ها را چک کنید:
```bash
journalctl -u faydo-backend -f
tail -f /var/log/nginx/faydo-error.log
```

برای SSL رایگان (اگر دامنه دارید)، از Certbot استفاده کنید.
