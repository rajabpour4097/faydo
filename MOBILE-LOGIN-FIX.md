# 🐛 Debug Guide - ورود با موبایل

## مشکل: کد تایید وارد می‌شود اما وارد داشبورد نمی‌شود

### ✅ راه‌حل‌های اعمال شده:

#### 1. **CORS Headers اصلاح شد**
```nginx
# قبل:
add_header Access-Control-Allow-Origin "https://localhost" always;

# بعد:
add_header Access-Control-Allow-Origin "$scheme://$host" always;
```

این باعث می‌شود که هم `localhost` و هم IP شبکه (مثل `192.168.70.102`) کار کنند.

#### 2. **صفحه Debug اضافه شد**
یک صفحه debug برای تست مستقیم از موبایل:
```
https://192.168.70.102/debug.html
```

## 📱 نحوه Debug از موبایل

### روش 1: استفاده از Debug Page

1. در مرورگر موبایل بروید به:
   ```
   https://192.168.70.102/debug.html
   ```

2. SSL warning را accept کنید

3. شماره تلفن خود را وارد کنید (مثلاً: `09111127685`)

4. روی "📤 ارسال کد" کلیک کنید
   - باید کد OTP را ببینید
   - در logs باید `✅ کد OTP ارسال شد` را ببینید

5. اگر کد auto-fill نشد، آن را وارد کنید

6. روی "✅ تأیید کد" کلیک کنید
   - باید `✅ کد تأیید صحیح است` را ببینید

7. روی "🔐 ورود با OTP" کلیک کنید
   - باید `✅ ورود موفق!` را ببینید
   - باید `✅ اطلاعات در localStorage ذخیره شد` را ببینید

8. روی "💾 بررسی LocalStorage" کلیک کنید
   - باید سه تیک سبز ببینید:
     - ✅ auth_user
     - ✅ access_token
     - ✅ refresh_token

9. اگر همه چیز OK بود، بعد از 2 ثانیه به `/dashboard` می‌رود

### روش 2: Chrome Remote Debugging (Android)

اگر debug page کار نکرد:

1. **در گوشی:**
   - Settings → About Phone → Build Number را 7 بار بزنید
   - Settings → Developer Options → USB Debugging را فعال کنید
   - گوشی را به کامپیوتر وصل کنید

2. **در کامپیوتر:**
   - Chrome را باز کنید
   - به `chrome://inspect` بروید
   - دستگاه گوشی را انتخاب کنید
   - "Inspect" را بزنید

3. **در DevTools:**
   - Console tab را باز کنید
   - Network tab را باز کنید
   - فیلتر را روی "XHR" بگذارید

4. **تست Login:**
   - در گوشی login کنید
   - در Console ببینید چه errorهایی می‌آید
   - در Network ببینید کدام request fail شده

## 🔍 مشکلات احتمالی و راه‌حل‌ها

### مشکل 1: CORS Error
```
Access to fetch at 'https://192.168.70.102/api/...' 
has been blocked by CORS policy
```

**راه‌حل:** ✅ حل شد با تغییر Nginx config

**تست:**
```bash
# در کامپیوتر:
curl -k -H "Origin: https://192.168.70.102" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://192.168.70.102/api/accounts/auth/send-otp/

# باید header ببینید:
# Access-Control-Allow-Origin: https://192.168.70.102
```

### مشکل 2: localStorage Empty
```javascript
// در Console موبایل:
localStorage.getItem('auth_user')  // null
```

**علت:**
- localStorage قبل از redirect flush نشده
- Browser cache دارد

**راه‌حل:**
```javascript
// قبل از redirect, 100ms delay اضافه شد:
setTimeout(() => {
  window.location.href = '/dashboard'
}, 100)
```

**تست دستی:**
```javascript
// در Console:
localStorage.setItem('test', '123')
localStorage.getItem('test')  // باید '123' برگردد
```

### مشکل 3: Network Timeout
```
TypeError: Failed to fetch
```

**علت:**
- شبکه ضعیف
- Django یا Nginx down است

**راه‌حل:**
```bash
# در کامپیوتر چک کنید:
ss -tuln | grep 8000  # Django
ss -tuln | grep 5173  # Vite  
ss -tuln | grep 443   # Nginx

# اگر نیست:
./stop-https.sh
./start-https.sh &
```

### مشکل 4: SSL Certificate
```
NET::ERR_CERT_AUTHORITY_INVALID
```

**راه‌حل:**
- در مرورگر: Advanced → Proceed
- یا از debug.html استفاده کنید که خودش handle می‌کند

### مشکل 5: API Returns 500
```json
{"detail": "Internal Server Error"}
```

**چک کنید:**
```bash
# Django log:
tail -f /tmp/django.log

# باید ببینید چه errorی رخ داده
```

## 📊 Console Logs مورد انتظار

### در Debug Page:

```
[time] 🚀 Mobile Debug Tool آماده است
[time] ℹ️ === بررسی LocalStorage ===
[time] ❌ auth_user: وجود ندارد
[time] ❌ access_token: وجود ندارد
[time] ❌ refresh_token: وجود ندارد

[time] ℹ️ درحال ارسال OTP به 09111127685...
[time] ℹ️ Response Status: 200
[time] ℹ️ Response Data: {"success":true,"message":"کد تایید ارسال شد","otp_code":"123456"}
[time] ✅ کد OTP ارسال شد: 123456

[time] ℹ️ درحال تأیید کد 123456...
[time] ℹ️ Response Status: 200
[time] ℹ️ Response Data: {"success":true,"message":"کد تایید صحیح است"}
[time] ✅ کد تأیید صحیح است

[time] ℹ️ درحال ورود با شماره 09111127685...
[time] ℹ️ Response Status: 200
[time] ℹ️ Response Data: {"success":true,"user":{...},"tokens":{...}}
[time] ✅ ورود موفق!
[time] ℹ️ Storing user: {...}
[time] ✅ اطلاعات در localStorage ذخیره شد

[time] ℹ️ === بررسی LocalStorage ===
[time] ✅ auth_user: {"id":40,"username":"user_127685_0069",...}...
[time] ✅ access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[time] ✅ refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[time] ℹ️ 🚀 در حال انتقال به داشبورد...
```

## 🎯 Checklist برای Debug

- [ ] HTTPS به IP متصل می‌شود (مثلاً `https://192.168.70.102`)
- [ ] SSL Warning را accept کردید
- [ ] به `/debug.html` رفتید
- [ ] API Base URL درست است (باید IP شما باشد)
- [ ] OTP ارسال می‌شود (200 OK)
- [ ] OTP verify می‌شود (200 OK)
- [ ] Login موفق است (200 OK)
- [ ] localStorage پُر شد (3 item)
- [ ] Redirect به /dashboard اتفاق افتاد
- [ ] Dashboard load شد و user login است

## 🛠️ دستورات مفید

```bash
# Restart همه چیز:
./stop-https.sh && sleep 2 && ./start-https.sh &

# چک کردن Nginx logs:
sudo tail -f /var/log/nginx/faydo-error.log

# چک کردن Django logs:
tail -f /tmp/django.log

# تست API از کامپیوتر:
curl -k https://192.168.70.102/api/accounts/users/ -I

# چک کردن IP:
hostname -I
```

## 📝 اگر هنوز کار نکرد

1. به `/debug.html` بروید
2. همه مراحل را انجام دهید
3. Screenshot از logs بگیرید
4. به ما بفرستید تا debug کنیم

## ✅ تغییرات این Session

1. ✅ Nginx CORS headers اصلاح شد
2. ✅ Debug page ساخته شد (`/debug.html`)
3. ✅ Console logs در AuthModal اضافه شد
4. ✅ setTimeout برای localStorage flush
5. ✅ راهنمای کامل debug

---

**IP فعلی:** `192.168.70.102`
**Debug URL:** `https://192.168.70.102/debug.html`
**تاریخ:** 2025-11-03
