# 📱 حل مشکل نوسان اتصال موبایل

## ❌ مشکل
گاهی موبایل به `https://192.168.70.102` وصل می‌شود، گاهی نه!

## 🔍 علت‌های نوسان

### 1. SSL Certificate Cache
موبایل certificate را cache می‌کند. وقتی:
- Server restart می‌شود
- Nginx restart می‌شود  
- IP تغییر می‌کند

Certificate قدیمی invalid می‌شود اما موبایل آن را cache دارد.

### 2. DNS/IP Cache
موبایل IP قدیمی را cache کرده و به آن سعی می‌کند متصل شود.

### 3. WiFi Sleep/Power Saving
وقتی موبایل idle است، WiFi به حالت sleep می‌رود و connection drop می‌شود.

### 4. DHCP IP Change
Router ممکن است IP جدیدی به لپتاپ بدهد.

### 5. Browser Cache/Cookies
مرورگر موبایل state قدیمی را cache کرده است.

## ✅ راه‌حل فوری (هر بار که مشکل دارید)

### روی موبایل:

#### گام 1: پاک کردن SSL Cache
**iOS Safari:**
```
Settings > Safari > Clear History and Website Data
```

**Android Chrome:**
```
Settings > Privacy > Clear browsing data
✓ Cached images and files
✓ Site settings
```

#### گام 2: Airplane Mode Toggle
```
1. Airplane mode را ON کنید
2. 5 ثانیه صبر کنید
3. Airplane mode را OFF کنید
4. منتظر بمانید WiFi وصل شود
```

#### گام 3: Forget WiFi & Reconnect
```
1. Settings > WiFi
2. روی نام WiFi بزنید
3. "Forget This Network"
4. دوباره وصل شوید
```

#### گام 4: مرورگر را کاملاً ببندید
```
1. از app switcher مرورگر را swipe کنید
2. 5 ثانیه صبر کنید
3. دوباره باز کنید
```

## 🔧 راه‌حل دائمی

### 1. استفاده از Static IP برای لپتاپ

با Static IP، آدرس شما هرگز تغییر نمی‌کند.

**در لپتاپ:**
```bash
./set-static-ip.sh
```

این IP ثابت `192.168.70.100` را تنظیم می‌کند.

**سپس nginx config و مستندات را آپدیت کنید:**
```bash
# 1. آپدیت nginx config
sed -i 's/192\.168\.70\.102/192.168.70.100/g' nginx-https.conf

# 2. آپدیت Django settings
sed -i "s/192\.168\.70\.102/192.168.70.100/g" backend/core/settings.py

# 3. آپدیت تمام مستندات
sed -i 's/192\.168\.70\.102/192.168.70.100/g' *.md

# 4. اعمال تغییرات
sudo cp nginx-https.conf /etc/nginx/sites-available/faydo-https
sudo nginx -t
sudo systemctl restart nginx

# 5. Restart backend and frontend
./stop-https.sh
./start-https.sh
```

**برای برگشت به DHCP:**
```bash
./set-dhcp-ip.sh
```

### 2. بهینه‌سازی SSL Certificate

در حال حاضر از self-signed certificate استفاده می‌کنید که باعث warning می‌شود.

**راه‌حل موقت:**
روی موبایل بعد از هر restart:
1. به `https://192.168.70.102` بروید
2. Warning را accept کنید
3. این کار را فقط یک بار بعد از restart انجام دهید

### 3. WiFi Power Saving را غیرفعال کنید

**iOS:**
```
Settings > WiFi > Auto-Join Hotspot > Never
Settings > General > Background App Refresh > WiFi & Mobile Data
```

**Android:**
```
Settings > Network & internet > WiFi > WiFi preferences
Turn off "Turn on Wi-Fi automatically"
Turn off "Notify for public networks"
```

### 4. Keep-Alive در Nginx

در `nginx-https.conf` این تنظیمات را اضافه کنید:
```nginx
# در بخش server
keepalive_timeout 65;
keepalive_requests 100;
```

این کار انجام شده است.

## 🧪 تست ثبات اتصال

### گام 1: بررسی IP فعلی
```bash
# روی لپتاپ
ip addr show wlo1 | grep "inet "
```

### گام 2: تست از لپتاپ
```bash
curl -k https://192.168.70.102/api/accounts/users/ -I
```

### گام 3: تست از موبایل
1. Airplane mode toggle کنید
2. Cache را پاک کنید  
3. مرورگر را ببندید
4. به `https://192.168.70.102` بروید
5. SSL warning را accept کنید
6. باید صفحه لاگین را ببینید

### گام 4: تست پایداری
```
1. 5 دقیقه صبر کنید
2. موبایل را idle بگذارید
3. دوباره به سایت بروید
4. باید بدون مشکل باز شود
```

## 📊 Checklist حل مشکل

زمانی که موبایل وصل نمی‌شود:

- [ ] **Serverها در حال اجرا هستند؟**
  ```bash
  ps aux | grep -E "manage.py|vite|nginx"
  ```

- [ ] **IP تغییر نکرده؟**
  ```bash
  ip addr show wlo1 | grep "inet "
  ```

- [ ] **از لپتاپ کار می‌کند؟**
  ```bash
  curl -k https://192.168.70.102/api/accounts/users/ -I
  ```

- [ ] **موبایل به همان WiFi وصل است؟**
  ```
  Settings > WiFi > نام شبکه را چک کنید
  ```

- [ ] **Airplane mode toggle کردید؟**

- [ ] **Cache مرورگر را پاک کردید؟**

- [ ] **مرورگر را کاملاً بستید و دوباره باز کردید؟**

- [ ] **SSL warning را accept کردید؟**

## 💡 نکات مهم

### چرا نوسان دارد؟

1. **DHCP**: هر بار که laptop یا router restart می‌شود، IP ممکن است تغییر کند
2. **Self-signed SSL**: مرورگر موبایل certificate را trust نمی‌کند و cache مشکل می‌شود
3. **Mobile WiFi Optimization**: موبایل‌ها برای صرفه‌جویی باتری، WiFi را optimization می‌کنند
4. **Browser Security**: مرورگرهای موبایل سخت‌گیرتر از desktop هستند

### راه‌حل قطعی (برای production):

1. **دامنه واقعی**: به جای IP از domain استفاده کنید
2. **SSL معتبر**: Let's Encrypt یا SSL certificate معتبر
3. **Static IP یا DNS**: از DHCP reservation یا local DNS استفاده کنید
4. **Deploy روی سرور**: به جای localhost، روی یک سرور deploy کنید

## 🚀 دستور سریع برای شروع مجدد

اگر موبایل وصل نمی‌شود:

```bash
# 1. Check IP
ip addr show wlo1 | grep "inet "

# 2. Restart everything
./stop-https.sh
./start-https.sh

# 3. Test
curl -k https://192.168.70.102/api/accounts/users/ -I
```

**روی موبایل:**
1. Airplane mode: ON → OFF
2. Clear cache
3. بستن کامل مرورگر
4. باز کردن مجدد سایت

---
**آخرین آپدیت:** 2025-11-03  
**IP فعلی:** 192.168.70.102  
**راه‌حل توصیه شده:** Static IP با `./set-static-ip.sh`
