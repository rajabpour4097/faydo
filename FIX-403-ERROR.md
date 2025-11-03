# 🔧 حل مشکل خطای 403 در موبایل

## ❌ مشکل
در صفحه debug روی موبایل، هنگام ارسال کد OTP خطای 403 Forbidden دریافت می‌شود.

## 🔍 علت
خطای 403 به این دلایل رخ می‌دهد:
1. **CSRF Token**: Django به طور پیش‌فرض CSRF token برای POST requests نیاز دارد
2. **SessionAuthentication**: DRF با SessionAuthentication به طور خودکار CSRF را چک می‌کند
3. **CSRF_TRUSTED_ORIGINS**: برای HTTPS با IP غیر از localhost باید تنظیم شود

## ✅ راه‌حل‌های پیاده‌سازی شده

### 1. تنظیم CSRF_TRUSTED_ORIGINS
در `backend/core/settings.py`:
```python
CSRF_TRUSTED_ORIGINS = [
    'https://localhost',
    'https://192.168.70.102',
    'https://127.0.0.1',
]
```

### 2. تنظیمات CSRF Cookie
```python
CSRF_COOKIE_SECURE = True  # فقط روی HTTPS
CSRF_COOKIE_HTTPONLY = False  # JavaScript می‌تواند بخواند
CSRF_COOKIE_SAMESITE = 'None'  # درخواست‌های cross-origin مجاز
CSRF_USE_SESSIONS = False  # از cookie استفاده کند نه session
```

### 3. غیرفعال کردن CSRF برای OTP endpoints
در `backend/accounts/views.py` برای تمام public endpoints:
```python
@api_view(['POST'])
@authentication_classes([])  # غیرفعال کردن SessionAuthentication
@permission_classes([AllowAny])
def send_otp_view(request):
    ...
```

این کار برای endpoints زیر انجام شد:
- ✅ `send_otp_view`
- ✅ `verify_otp_view`
- ✅ `login_with_otp_view`
- ✅ `register_view`
- ✅ `business_register_view`
- ✅ `login_view`

### 4. حذف VITE_API_BASE_URL از .env.local
فایل `frontend/.env.local` به این صورت تغییر کرد:
```bash
# API Base URL - خالی بگذارید تا از dynamic host استفاده کند
# VITE_API_BASE_URL=

# Enable HTTPS in Vite dev server
HTTPS=true
```

## 🧪 تست راه‌حل

### قبل از تست: Restart servers
```bash
cd /home/mohammad/project/test/django/Faydo/faydo
./stop-https.sh
./start-https.sh
```

### گام 1: تست با curl
```bash
curl -X POST https://192.168.70.102/api/accounts/otp/send/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"09123456789"}' \
  -k -v
```

**نتیجه مورد انتظار:**
```
< HTTP/2 200
{"success":true,"message":"کد تایید ارسال شد"}
```

### گام 2: تست روی موبایل
1. بروید به: `https://192.168.70.102/debug.html`
2. شماره تلفن را وارد کنید
3. روی "ارسال کد" بزنید
4. در قسمت Console Logs باید ببینید:
```
✅ Send OTP Success
Response: {"success":true,"message":"کد تایید ارسال شد"}
```

**اگر هنوز 403 می‌دهد:**
- مطمئن شوید که serverها restart شدند
- Cache مرورگر را پاک کنید
- مرورگر را ببندید و دوباره باز کنید

### گام 3: تست کامل flow
1. شماره تلفن را وارد کنید
2. کد OTP را دریافت کنید
3. کد را وارد کنید
4. روی "ورود با OTP" بزنید

**Console logs مورد انتظار:**
```
✅ Send OTP Success
✅ Verify OTP Success
✅ Login Success
User: {...}
Tokens: {...}
```

## 🔍 دیباگ اگر مشکل ادامه داشت

### بررسی Backend logs
در ترمینال backend به دنبال این پیام‌ها بگردید:
```
Forbidden (CSRF token missing or incorrect)
```

### بررسی Network tab در DevTools
1. F12 را بزنید
2. به tab Network بروید
3. درخواست POST را انتخاب کنید
4. در قسمت Headers بررسی کنید:
   - **Request URL**: باید `https://192.168.70.102/api/accounts/otp/send/` باشد
   - **Request Method**: باید `POST` باشد
   - **Status Code**: اگر 403 بود به Response نگاه کنید

### بررسی CORS headers
در Response Headers باید این‌ها باشد:
```
access-control-allow-origin: https://192.168.70.102
access-control-allow-credentials: true
access-control-allow-methods: POST, OPTIONS, ...
```

## 📝 تغییرات فایل‌ها

### فایل‌های تغییر یافته:
1. ✅ `backend/core/settings.py`
   - اضافه شدن CSRF_TRUSTED_ORIGINS
   - تنظیمات CSRF Cookie

2. ✅ `backend/accounts/views.py`
   - اضافه شدن `@authentication_classes([])` به public endpoints
   - import کردن `authentication_classes`

3. ✅ `frontend/.env.local`
   - حذف VITE_API_BASE_URL برای استفاده از dynamic host

### فایل‌های نیازی به تغییر نداشتند:
- ✅ `nginx-https.conf` - قبلاً CORS headers را اضافه کردیم
- ✅ `frontend/src/services/api.ts` - قبلاً dynamic URL را پیاده کردیم

## 🎯 چک‌لیست نهایی

- [ ] CSRF_TRUSTED_ORIGINS شامل IP شما هست؟
- [ ] authentication_classes([]) به OTP views اضافه شد؟
- [ ] VITE_API_BASE_URL از .env.local حذف شد؟
- [ ] Servers را restart کردید؟
- [ ] Cache مرورگر را پاک کردید؟
- [ ] با curl تست کردید - کار می‌کند؟
- [ ] روی موبایل تست کردید - کار می‌کند؟

## 💡 نکات مهم

### برای Production:
این تنظیمات برای development است. در production:
- `ALLOWED_HOSTS` را محدود کنید
- `CORS_ALLOW_ALL_ORIGINS = False` کنید و origins خاص را تعریف کنید
- CSRF_TRUSTED_ORIGINS را فقط به domain واقعی محدود کنید
- از SSL certificate معتبر استفاده کنید

### امنیت:
غیرفعال کردن CSRF برای OTP endpoints امن است چون:
- این endpoints نیازی به authentication ندارند
- کاربر هنوز باید OTP را از SMS دریافت کند
- Login فقط بعد از verify کردن OTP امکان‌پذیر است

---
**آخرین آپدیت:** 2025-11-03
**مشکل حل شده:** خطای 403 در OTP endpoints
