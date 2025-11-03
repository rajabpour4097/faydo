# 🔧 راهنمای دیباگ مشکل لاگین موبایل

## ❌ مشکل
- در حالت موبایل مرورگر دسکتاپ، لاگین کار می‌کند
- در موبایل واقعی، بعد از وارد کردن کد تایید، به داشبورد نمی‌رود

## 🔍 علت‌های احتمالی

### 1. localStorage در موبایل flush نمی‌شود
موبایل‌ها (خصوصاً Safari) ممکن است localStorage را بلافاصله ذخیره نکنند.

### 2. Private Browsing Mode
اگر مرورگر در حالت Private/Incognito باشد، localStorage کار نمی‌کند.

### 3. SSL Certificate Warning
گواهی SSL self-signed است و ممکن است مرورگر موبایل آن را بلاک کند.

### 4. Redirect قبل از ذخیره localStorage
`window.location.href` ممکن است قبل از flush شدن localStorage اجرا شود.

## ✅ راه‌حل‌های پیاده‌سازی شده

### 1. افزایش زمان setTimeout
```typescript
// از 100ms به 300ms افزایش یافت
setTimeout(() => {
  window.location.href = '/dashboard?tab=profile&welcome=true'
}, 300)
```

### 2. اضافه کردن try-catch و force flush
```typescript
try {
  localStorage.setItem('auth_user', JSON.stringify(mappedUser))
  localStorage.setItem('access_token', loginData.tokens.access)
  localStorage.setItem('refresh_token', loginData.tokens.refresh)
  
  // Force localStorage to flush (mobile Safari fix)
  localStorage.getItem('auth_user')
  
  console.log('[MOBILE DEBUG] Storage successful')
} catch (error) {
  console.error('[MOBILE DEBUG] Storage failed:', error)
  alert('خطا در ذخیره‌سازی اطلاعات. لطفاً مرورگر خود را در حالت عادی (نه Private) باز کنید.')
  return
}
```

### 3. اضافه کردن console.log های مفصل
- در `AuthModal.tsx`: تمام مراحل لاگین لاگ می‌شود
- در `AuthContext.tsx`: تمام مراحل بررسی session لاگ می‌شود
- همه لاگ‌ها با prefix `[MOBILE DEBUG]` شروع می‌شوند

## 🧪 مراحل تست

### گام 1: تست localStorage روی موبایل
1. روی موبایل بروید به: `https://192.168.70.102/storage-test.html`
2. روی "تست نوشتن" بزنید
3. روی "تست خواندن" بزنید
4. روی "رفرش صفحه" بزنید
5. بررسی کنید که آیا داده‌ها بعد از رفرش هنوز موجود هستند

**اگر localStorage کار نکرد:**
- مرورگر را در حالت عادی باز کنید (نه Private/Incognito)
- Settings مرورگر را چک کنید که cookies و storage مجاز باشند

### گام 2: مشاهده Console Logs
1. روی موبایل بروید به: `https://192.168.70.102/debug.html`
2. وارد شماره تلفن شوید و OTP بگیرید
3. کد تایید را وارد کنید
4. **به Console Logs دقت کنید**

**لاگ‌های مورد انتظار:**
```
[MOBILE DEBUG] Storing user in localStorage: {...}
[MOBILE DEBUG] Tokens: {...}
[MOBILE DEBUG] Storage successful: {hasUser: true, hasAccessToken: true, ...}
[MOBILE DEBUG] Starting redirect in 300ms...
[MOBILE DEBUG] Redirecting now...
```

### گام 3: تست لاگین واقعی
1. روی موبایل بروید به: `https://192.168.70.102`
2. Developer Tools را باز کنید:
   - **Android Chrome**: `chrome://inspect/#devices` روی کامپیوتر
   - **iOS Safari**: Settings > Safari > Advanced > Web Inspector (روی Mac)
3. وارد شوید و Console را مشاهده کنید
4. بعد از redirect، چک کنید که این لاگ‌ها ظاهر می‌شوند:
```
[MOBILE DEBUG - AuthContext] Starting auth check...
[MOBILE DEBUG - AuthContext] Storage check: {hasSavedUser: true, hasAccessToken: true}
[MOBILE DEBUG - AuthContext] Found stored session, validating...
[MOBILE DEBUG - AuthContext] Session validated successfully
```

## 🐛 مشکلات احتمالی و راه‌حل

### مشکل: localStorage خالی است بعد از redirect
**علت:** Private browsing یا تنظیمات مرورگر
**راه‌حل:** 
- مرورگر را در حالت عادی باز کنید
- Settings > Safari > Block All Cookies را غیرفعال کنید

### مشکل: SSL Certificate Error
**علت:** گواهی self-signed است
**راه‌حل:**
- روی "Advanced" بزنید
- "Proceed to 192.168.70.102 (unsafe)" را بزنید

### مشکل: "Error validating session" در console
**علت:** Token منقضی شده یا API در دسترس نیست
**راه‌حل:**
- چک کنید که backend و nginx در حال اجرا هستند
- با `curl -k https://192.168.70.102/api/accounts/users/` تست کنید

### مشکل: Redirect نمی‌شود اصلاً
**علت:** JavaScript error یا مرورگر popup را بلاک کرده
**راه‌حل:**
- Console را چک کنید برای error های JavaScript
- Popup blocker را غیرفعال کنید

## 📊 Checklist دیباگ

- [ ] localStorage در `storage-test.html` کار می‌کند؟
- [ ] مرورگر در حالت عادی است (نه Private)?
- [ ] SSL warning را قبول کرده‌اید؟
- [ ] Console logs را می‌بینید؟
- [ ] `[MOBILE DEBUG] Storage successful` را می‌بینید؟
- [ ] بعد از redirect، `[MOBILE DEBUG - AuthContext]` لاگ‌ها را می‌بینید؟
- [ ] Backend و Nginx در حال اجرا هستند؟

## 🔧 تغییرات اعمال شده

### فایل: `frontend/src/components/auth/AuthModal.tsx`
- ✅ setTimeout از 100ms به 300ms افزایش یافت
- ✅ try-catch اضافه شد
- ✅ Force flush با `localStorage.getItem()` اضافه شد
- ✅ Console logs مفصل اضافه شد
- ✅ Alert برای خطای storage اضافه شد

### فایل: `frontend/src/contexts/AuthContext.tsx`
- ✅ Console logs مفصل در useEffect اضافه شد
- ✅ لاگ کردن وضعیت localStorage در startup
- ✅ لاگ کردن نتیجه validation

### فایل: `frontend/public/storage-test.html`
- ✅ ساخته شد - ابزار تست localStorage
- ✅ نمایش real-time وضعیت storage
- ✅ دکمه‌های تست نوشتن/خواندن/پاک کردن

## 📱 تست نهایی

1. بروید به `https://192.168.70.102/storage-test.html`
2. تست کنید که localStorage کار می‌کند
3. بروید به `https://192.168.70.102`
4. لاگین کنید و console را مشاهده کنید
5. اگر مشکل ادامه داشت، screenshot از console بگیرید

---
**آخرین آپدیت:** 2025-11-03
**IP صحیح سیستم:** `192.168.70.102`
