# 🚀 VPS Deployment Checklist (Ubuntu 22.04+)

این چک‌لیست، مراحل کامل استقرار پروژه Faydo روی VPS را از صفر تا انتشار پوشش می‌دهد. فرض‌ها:
- OS: Ubuntu 22.04 LTS
- دامنه اختیاری: example.com (اگر دامنه ندارید از IP استفاده کنید)
- Backend: Django + Gunicorn
- Frontend: Vite build (static) یا Dev proxy (dev فقط برای تست)
- Reverse Proxy: Nginx (HTTPS)

---

## 1) آماده‌سازی سرور

- [ ] آپدیت سیستم
```bash
sudo apt update && sudo apt upgrade -y
```
- [ ] نصب ابزارهای لازم
```bash
sudo apt install -y git curl ufw nginx python3-pip python3-venv
```
- [ ] تنظیم ساعت سرور (اختیاری اما مفید)
```bash
sudo timedatectl set-timezone Asia/Tehran
```

---

## 2) فایروال (UFW)

- [ ] اجازه دسترسی به SSH، HTTP، HTTPS
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 3) کلون پروژه و ساخت محیط

- [ ] کلون مخزن
```bash
cd /var/www
sudo mkdir -p faydo && sudo chown $USER:$USER faydo
cd faydo
git clone https://github.com/rajabpour4097/faydo .
```
- [ ] ساخت venv و نصب پکیج‌ها
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```
- [ ] ساخت env ها (Django)
```bash
cp backend/.env.example backend/.env  # اگر ندارید، حداقل SECRET_KEY, DEBUG, DB
# یا مستقیم در settings.py مقداردهی کنید برای شروع
```

---

## 4) Database و Migrations

- [ ] اجرای migrate و جمع‌آوری استاتیک‌ها
```bash
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # اختیاری
```

---

## 5) Gunicorn (Systemd Service)

- [ ] نصب Gunicorn
```bash
pip install gunicorn
```
- [ ] ساخت سرویس systemd
فایل: `/etc/systemd/system/faydo-backend.service`
```
[Unit]
Description=Faydo Django Gunicorn
After=network.target

[Service]
User=%i
Group=www-data
WorkingDirectory=/var/www/faydo/backend
Environment="DJANGO_SETTINGS_MODULE=core.settings"
ExecStart=/var/www/faydo/venv/bin/gunicorn --access-logfile - \
          --workers 3 --bind 127.0.0.1:8001 core.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```
- [ ] بارگذاری و راه‌اندازی سرویس
```bash
sudo systemctl daemon-reload
sudo systemctl enable faydo-backend
sudo systemctl start faydo-backend
sudo systemctl status faydo-backend
```

تست سریع:
```bash
curl -I http://127.0.0.1:8001/api/accounts/users/
```

---

## 6) Frontend (Build Static یا Proxy)

گزینه A - Build Production (توصیه‌شده)
- [ ] نصب Node LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```
- [ ] نصب و build
```bash
cd /var/www/faydo/frontend
npm ci || npm install
npm run build
```
- [ ] سرو کردن استاتیک‌ها با Nginx
خروجی build در `frontend/dist` است.

گزینه B - Dev (فقط موقت)
- Vite dev server را روی 5173 بالا ببرید و در Nginx به آن proxy دهید (برای تولید توصیه نمی‌شود).

---

## 7) Nginx (Reverse Proxy + SSL)

- [ ] ساخت فایل سایت Nginx
فایل: `/etc/nginx/sites-available/faydo`
```
server {
    listen 80;
    server_name example.com your.server.ip;

    # HTTP → HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com your.server.ip;

    # SSL (Let's Encrypt یا self-signed موقت)
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    # اگر دامنه ندارید: از self-signed استفاده کنید (فایل‌های خودتان)
    # ssl_certificate     /etc/nginx/ssl/localhost.crt;
    # ssl_certificate_key /etc/nginx/ssl/localhost.key;

    # امنیت پایه
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # استاتیک‌های Frontend (گزینه A)
    root /var/www/faydo/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API → Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media/Static Django (اگر نیاز است)
    location /media/ {
        alias /var/www/faydo/backend/media/;
    }
    location /static/ {
        alias /var/www/faydo/backend/staticfiles/;
    }

    # Health
    location /health { return 200 'OK'; add_header Content-Type text/plain; }
}
```
- [ ] فعال‌سازی سایت و تست
```bash
sudo ln -s /etc/nginx/sites-available/faydo /etc/nginx/sites-enabled/faydo
sudo nginx -t && sudo systemctl reload nginx
```

---

## 8) SSL با Let's Encrypt (اگر دامنه دارید)

- [ ] نصب Certbot
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```
- [ ] دریافت گواهی
```bash
sudo certbot --nginx -d example.com -d www.example.com
```
- [ ] تست تمدید خودکار
```bash
sudo certbot renew --dry-run
```

اگر دامنه ندارید: موقتاً self-signed بگذارید و در موبایل/کلاینت Allow کنید.

---

## 9) تنظیمات Django برای Production

- [ ] `DEBUG = False`
- [ ] `ALLOWED_HOSTS = ['example.com', 'your.server.ip']`
- [ ] `CSRF_TRUSTED_ORIGINS = ['https://example.com', 'https://www.example.com']`
- [ ] CORS: بر اساس نیاز محدود کنید (برای تولید توصیه می‌شود)
- [ ] SECRET_KEY امن و خارج از کد (env)

---

## 10) سرویس‌های کمک‌کننده (اختیاری ولی مفید)

- [ ] لاگ‌ها
```bash
sudo journalctl -u faydo-backend -f
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```
- [ ] Supervisor جایگزین systemd (اختیاری)
- [ ] Sentry برای error tracking (اختیاری)

---

## 11) تست نهایی

- [ ] از بیرون VPS:
  - https://example.com → صفحه Frontend
  - https://example.com/api/accounts/users/ → 200 OK
- [ ] اگر SPA است: مسیرهای داخلی مثل `/dashboard` → index.html
- [ ] روی موبایل واقعی تست کنید

---

## 12) نکات عملی

- اگر دامنه ندارید، در `server_name` از IP استفاده کنید
- اگر `frontend/dist` ندارید و می‌خواهید Dev proxy کنید:
  - در بلاک `location /` به‌جای root:
  ```nginx
  location / {
      proxy_pass http://127.0.0.1:5173;
      proxy_set_header Host $host;
  }
  ```
  - اما برای تولید توصیه نمی‌شود
- Media/Static Django را با `alias` به مسیرهای واقعی bind کنید
- مالکیت پوشه‌ها: `www-data` برای Nginx و دسترسی خواندن به مسیرها

---

## 13) Rollback سریع

- Nginx reload به config قبلی:
```bash
sudo nginx -t && sudo systemctl reload nginx
```
- Gunicorn restart:
```bash
sudo systemctl restart faydo-backend
```

---

موفق باشید! اگر دامنه یا IP خاص دارید، فایل Nginx را برای شما شخصی‌سازی می‌کنم. اگر ترجیح می‌دهید Docker استفاده کنیم، می‌توانم docker-compose تولیدی هم آماده کنم. ✅
