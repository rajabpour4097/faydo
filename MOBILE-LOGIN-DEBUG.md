# راهنمای Debugging ورود در موبایل

## مشکل
در حالت موبایل، بعد از وارد کردن کد OTP، کاربر وارد نمی‌شود.

## علل احتمالی و راه‌حل‌ها

### 1. localStorage در موبایل
در مرورگرهای موبایل، localStorage ممکن است به درستی flush نشود.

**راه‌حل:** 
- اضافه کردن `setTimeout` قبل از `window.location.href`
- اضافه کردن console.log برای debug

### 2. HTTPS و SSL Certificate
در موبایل، اگر SSL certificate قبول نشده باشد، API callها fail می‌شوند.

**راه‌حل:**
- ابتدا به `https://localhost` بروید
- "Advanced" → "Proceed to localhost" را بزنید
- سپس Login را امتحان کنید

### 3. Cache مرورگر
مرورگر موبایل ممکن است JS فایل‌های قدیمی را cache کرده باشد.

**راه‌حل:**
- Hard refresh: Settings → Clear browser cache
- یا از Incognito/Private mode استفاده کنید

### 4. Console Debugging در موبایل

#### روش 1: Chrome DevTools (Android)
1. تلفن خود را به کامپیوتر وصل کنید
2. USB Debugging را فعال کنید
3. در Chrome desktop، به `chrome://inspect` بروید
4. دستگاه موبایل را انتخاب کنید
5. Console را باز کنید و errors را ببینید

#### روش 2: Safari DevTools (iOS)
1. در iPhone: Settings → Safari → Advanced → Web Inspector (فعال کنید)
2. تلفن را به Mac وصل کنید
3. در Safari Mac: Develop → [Device Name] → [Website]
4. Console را باز کنید

#### روش 3: Eruda (در خود موبایل)
در صفحه Home یا هر صفحه دیگر، در Console بنویسید:
```javascript
// Add Eruda for mobile debugging
var script = document.createElement('script');
script.src="//cdn.jsdelivr.net/npm/eruda";
document.body.appendChild(script);
script.onload = function () { eruda.init(); }
```

### 5. تست مستقیم API در موبایل

باز کردن مرورگر موبایل و رفتن به:
```
https://localhost/api/accounts/auth/send-otp/
```

اگر error SSL بیاید، باید certificate را accept کنید.

## Console Logs اضافه شده

در `AuthModal.tsx`، این logها اضافه شده:

```typescript
console.log('Storing user in localStorage:', mappedUser)
console.log('Tokens:', { access: '...', refresh: '...' })
console.log('Verify localStorage:', {
  hasUser: !!localStorage.getItem('auth_user'),
  hasAccessToken: !!localStorage.getItem('access_token'),
  hasRefreshToken: !!localStorage.getItem('refresh_token')
})
```

## تست در موبایل

### گام به گام:
1. در مرورگر موبایل به `https://localhost` بروید
2. "Advanced" → "Proceed to localhost"
3. Console را باز کنید (با Eruda یا Chrome Remote Debugging)
4. دکمه "ورود/ثبت نام" را بزنید
5. شماره تلفن را وارد کنید
6. "ارسال کد" را بزنید
7. در Console باید ببینید: `{"success":true,"otp_code":"XXXXXX"}`
8. کد را وارد کنید و "ورود" را بزنید
9. در Console باید ببینید:
   - `Storing user in localStorage: {...}`
   - `Tokens: {...}`
   - `Verify localStorage: {hasUser: true, hasAccessToken: true, ...}`
10. صفحه باید به `/dashboard` برود

## اگر هنوز کار نکرد

### بررسی Network Tab:
1. Network tab را باز کنید
2. Filter را روی "XHR" بگذارید
3. مراحل login را انجام دهید
4. ببینید کدام requestها fail شدند
5. Response هر request را بررسی کنید

### بررسی localStorage:
در Console بنویسید:
```javascript
console.log('auth_user:', localStorage.getItem('auth_user'))
console.log('access_token:', localStorage.getItem('access_token'))
console.log('refresh_token:', localStorage.getItem('refresh_token'))
```

### بررسی AuthContext:
در Console بنویسید:
```javascript
// Check if user is loaded in React context
// (نیاز به React DevTools دارد)
```

## تغییرات اعمال شده

### 1. `frontend/src/components/auth/AuthModal.tsx`
- اضافه کردن console.log برای debugging
- اضافه کردن `setTimeout(100)` قبل از redirect
- Map کردن صحیح `role` به `type`

### 2. `frontend/src/services/api.ts`
- تغییر `API_BASE_URL` به dynamic URL

### 3. `frontend/.env.local`
- تغییر `VITE_API_URL` به `VITE_API_BASE_URL`

## نکات مهم

1. **همیشه HTTPS استفاده کنید** (برای دوربین و GPS)
2. **Certificate را در موبایل accept کنید**
3. **Cache را clear کنید** بعد از هر تغییر
4. **Console را چک کنید** برای errors
5. **Network tab را ببینید** برای failed requests

## دستورات مفید

```bash
# Restart servers
./stop-https.sh && sleep 2 && ./start-https.sh &

# Check logs
tail -f /tmp/django.log
tail -f /tmp/vite.log

# Check if services are running
lsof -i :8000  # Django
lsof -i :5173  # Vite
lsof -i :443   # Nginx
```

## پشتیبانی
اگر مشکل همچنان ادامه دارد:
1. Screenshot از Console errors بگیرید
2. Network tab را capture کنید
3. localStorage content را چک کنید
4. به تیم پشتیبانی گزارش دهید
